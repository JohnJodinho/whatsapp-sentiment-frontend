# WhatsApp Chat Dashboard - Backend Implementation Blueprint

## 1. Critical Data Schema Requirements

### Required Message Fields
Based on the frontend logic in `api.ts` and mock data structure, each message in the database must have these fields:

```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    chat_id INTEGER,
    sender VARCHAR(255),  -- Original participant name
    text TEXT,           -- Message content
    timestamp TIMESTAMP, -- Stored as UTC, converted from date field
    
    -- Analytics Fields (Must be computed during chat ingestion)
    word_count INTEGER,
    emojis_count INTEGER,
    links_count INTEGER,
    is_question BOOLEAN,
    is_media BOOLEAN
);
```

### Missing Analytics Fields
The following fields are critical for the frontend's activity analysis but are likely missing from your current Message model:

1. `word_count`: Used in activity metrics
2. `emojis_count`: Required for emoji usage analysis
3. `links_count`: Required for link sharing analysis
4. `is_question`: Required for question frequency analysis
5. `is_media`: Required for media sharing analysis

**CRITICAL**: These fields must be populated during initial chat ingestion, not computed on-the-fly during dashboard queries.

## 2. Core Filtering Logic

All dashboard queries must implement these three primary filters:

### 1. Date Range Filter
```sql
WHERE messages.timestamp BETWEEN :start_date AND :end_date
```

### 2. Participants Filter
```sql
-- Only apply if participants filter is not empty
WHERE messages.sender = ANY(:participant_names)
```

### 3. Time Period Filter
```sql
-- Applied based on EXTRACT(HOUR FROM timestamp)
CASE 
    WHEN :time_period = 'Morning' THEN 
        EXTRACT(HOUR FROM timestamp) BETWEEN 6 AND 11
    WHEN :time_period = 'Afternoon' THEN 
        EXTRACT(HOUR FROM timestamp) BETWEEN 12 AND 16
    WHEN :time_period = 'Evening' THEN 
        EXTRACT(HOUR FROM timestamp) BETWEEN 17 AND 20
    WHEN :time_period = 'Night' THEN 
        EXTRACT(HOUR FROM timestamp) BETWEEN 21 AND 23 
        OR EXTRACT(HOUR FROM timestamp) BETWEEN 0 AND 5
    ELSE TRUE -- 'All Day'
END
```

## 3. Component-by-Component Implementation Guide

### A. Participants List (For Filter Dropdown)
```sql
SELECT DISTINCT sender 
FROM messages 
WHERE chat_id = :chat_id
ORDER BY sender;
```

### B. KPI Metrics
Each KPI requires specific aggregations:

1. Total Messages:
```sql
SELECT COUNT(*) as total_messages
FROM messages
WHERE [apply_filters];
```

2. Active Participants:
```sql
SELECT COUNT(DISTINCT sender) as active_participants
FROM messages
WHERE [apply_filters];
```

3. Active Days:
```sql
SELECT COUNT(DISTINCT DATE(timestamp)) as active_days
FROM messages
WHERE [apply_filters];
```

4. Avg. Messages/Day:
```sql
WITH stats AS (
    SELECT 
        COUNT(*) as message_count,
        COUNT(DISTINCT DATE(timestamp)) as days
    FROM messages
    WHERE [apply_filters]
)
SELECT 
    ROUND(CAST(message_count AS FLOAT) / NULLIF(days, 0), 1) as avg_per_day
FROM stats;
```

#### Sparkline Generation
For "Total Messages" and "Active Participants" sparklines:

1. First determine the aggregation level based on total time span:
```sql
WITH date_range AS (
    SELECT 
        MIN(DATE(timestamp)) as start_date,
        MAX(DATE(timestamp)) as end_date,
        DATE_DIFF('day', MIN(DATE(timestamp)), MAX(DATE(timestamp))) as days_span
    FROM messages
    WHERE [apply_filters]
)
```

2. Then aggregate accordingly:
```sql
-- For <= 60 days: Daily
SELECT 
    DATE(timestamp) as period,
    COUNT(*) as message_count,
    COUNT(DISTINCT sender) as participant_count
FROM messages
WHERE [apply_filters]
GROUP BY DATE(timestamp)
ORDER BY period;

-- For 61-365 days: Weekly
SELECT 
    DATE_TRUNC('week', timestamp) as period,
    COUNT(*) as message_count,
    COUNT(DISTINCT sender) as participant_count
FROM messages
WHERE [apply_filters]
GROUP BY DATE_TRUNC('week', timestamp)
ORDER BY period;

-- For > 365 days: Monthly
SELECT 
    DATE_TRUNC('month', timestamp) as period,
    COUNT(*) as message_count,
    COUNT(DISTINCT sender) as participant_count
FROM messages
WHERE [apply_filters]
GROUP BY DATE_TRUNC('month', timestamp)
ORDER BY period;
```

### C. Messages Over Time Chart
Uses same aggregation logic as sparklines:

```sql
WITH date_range AS (
    SELECT 
        MIN(DATE(timestamp)) as start_date,
        MAX(DATE(timestamp)) as end_date,
        DATE_DIFF('day', MIN(DATE(timestamp)), MAX(DATE(timestamp))) as days_span
    FROM messages
    WHERE [apply_filters]
)
SELECT 
    -- Choose bucket based on days_span from date_range
    CASE 
        WHEN days_span <= 60 THEN DATE(timestamp)
        WHEN days_span <= 365 THEN DATE_TRUNC('week', timestamp)
        ELSE DATE_TRUNC('month', timestamp)
    END as date,
    COUNT(*) as count
FROM messages
WHERE [apply_filters]
GROUP BY 1
ORDER BY 1;
```

### D. Activity Charts

#### 1. Day Activity
```sql
SELECT 
    EXTRACT(DOW FROM timestamp) as day_number,
    COUNT(*) as messages
FROM messages
WHERE [apply_filters]
GROUP BY day_number
ORDER BY day_number;
```

#### 2. Hour Activity
```sql
SELECT 
    EXTRACT(HOUR FROM timestamp) as hour,
    COUNT(*) as messages
FROM messages
WHERE [apply_filters]
GROUP BY hour
ORDER BY hour;
```

### E. Contribution Chart
The query varies based on number of participants:

1. Single Participant:
```sql
WITH filtered_counts AS (
    SELECT COUNT(*) as filtered_count
    FROM messages
    WHERE [apply_filters]
),
total_counts AS (
    SELECT COUNT(*) as total_count
    FROM messages
    WHERE chat_id = :chat_id
    AND timestamp BETWEEN :start_date AND :end_date
)
SELECT 
    (filtered_count::float / total_count) * 100 as percentage,
    100 - (filtered_count::float / total_count) * 100 as others_percentage
FROM filtered_counts, total_counts;
```

2. Two Participants:
```sql
SELECT 
    sender,
    COUNT(*) as messages
FROM messages
WHERE [apply_filters]
GROUP BY sender;
```

3. Multi Participant:
```sql
SELECT 
    sender as name,
    COUNT(*) as messages
FROM messages
WHERE [apply_filters]
GROUP BY sender
ORDER BY messages DESC;
```

### F. Activity Metrics

This requires the analytics fields:

```sql
SELECT 
    sender,
    COUNT(*) as text_messages,
    SUM(CASE WHEN is_media THEN 1 ELSE 0 END) as media_count,
    SUM(links_count) as links_count,
    SUM(CASE WHEN is_question THEN 1 ELSE 0 END) as questions_count,
    SUM(emojis_count) as emoji_count
FROM messages
WHERE [apply_filters]
GROUP BY sender
ORDER BY COUNT(*) DESC
LIMIT 3; -- Frontend only shows top 3
```

### G. Timeline

Monthly aggregation with complex subqueries:

```sql
WITH monthly_stats AS (
    SELECT 
        DATE_TRUNC('month', timestamp) as month,
        COUNT(*) as total_messages,
        COUNT(DISTINCT sender) as active_participants,
        -- Find peak day
        FIRST(DATE(timestamp) ORDER BY daily_count DESC) as peak_day,
        -- Participant stats
        STRING_AGG(DISTINCT sender, ',') as participants,
        FIRST(sender ORDER BY sender_count DESC) as most_active
    FROM (
        SELECT 
            timestamp,
            sender,
            COUNT(*) OVER (PARTITION BY DATE(timestamp)) as daily_count,
            COUNT(*) OVER (PARTITION BY sender) as sender_count
        FROM messages
        WHERE [apply_filters]
    ) msg
    GROUP BY DATE_TRUNC('month', timestamp)
)
-- Format results based on participant count conditions...
```

## 4. Performance Considerations

1. Required Indexes:
```sql
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_sender ON messages(sender);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
```

2. Materialized Views:
Consider creating materialized views for:
- Daily message counts
- Hourly patterns
- Participant activity summaries

3. Caching:
Implement Redis caching for:
- Participant lists
- Recent dashboard results
- KPI calculations

4. Query Optimization:
- Use CTEs for complex queries
- Aggregate at the lowest level first
- Use EXPLAIN ANALYZE to verify query plans