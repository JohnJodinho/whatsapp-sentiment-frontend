# WhatsApp Dashboard Backend Implementation

## Overview

This document details the implementation of the WhatsApp chat dashboard backend, following the frontend requirements specified in the dashboard logic blueprint.

## API Usage Guide for Frontend

### Dashboard Endpoint

```
GET /dashboard/{chat_id}
```

#### Path Parameters
- `chat_id`: ID of the chat to get dashboard data for (required)

#### Query Parameters
All query parameters are optional:

```typescript
interface DashboardQueryParams {
    start_date?: string;     // ISO 8601 format, e.g., "2025-11-02T00:00:00Z"
    end_date?: string;       // ISO 8601 format, e.g., "2025-11-02T23:59:59Z"
    participants?: string[]; // Array of participant names, passed as repeated parameter
    time_period?: "Morning" | "Afternoon" | "Evening" | "Night" | "All Day";
}
```

#### Example Requests

1. Basic request (no filters):
```http
GET /dashboard/123
```

2. With date range:
```http
GET /dashboard/123?start_date=2025-10-01T00:00:00Z&end_date=2025-10-31T23:59:59Z
```

3. With participant filter:
```http
GET /dashboard/123?participants=John&participants=Alice
```

4. With time period:
```http
GET /dashboard/123?time_period=Morning
```

5. With all filters combined:
```http
GET /dashboard/123
    ?start_date=2025-10-01T00:00:00Z
    &end_date=2025-10-31T23:59:59Z
    &participants=John
    &participants=Alice
    &time_period=Morning
```

#### Response Format

```typescript
interface DashboardResponse {
    participants: string[];           // All available participants for filtering
    participantCount: number;         // Number of participants after filtering
    
    kpiMetrics: Array<{
        label: string;               // e.g., "Total Messages"
        value: number;               // The metric value
        definition: string;          // Description of the metric
    }>;
    
    messageSparkline: Array<{
        period: string;              // ISO date string
        message_count: number;       // Messages in this period
    }>;
    
    participantSparkline: Array<{
        period: string;              // ISO date string
        participant_count: number;    // Active participants in this period
    }>;
    
    messagesOverTime: Array<{
        date: string;                // ISO date string
        count: number;               // Message count
    }>;
    
    activityByDay: Array<{
        day: string;                 // "Sun", "Mon", etc.
        messages: number;            // Message count
    }>;
    
    hourlyActivity: Array<{
        hour: number;                // 0-23
        messages: number;            // Message count
    }>;
    
    contribution: {
        type: "single" | "two" | "multi";
        data: any;                   // Format varies based on type
    };
    
    activityMetrics: Array<{
        sender: string;              // Participant name
        text_messages: number;       // Regular messages
        media_count: number;         // Media messages
        links_count: number;         // Messages with links
        questions_count: number;     // Questions asked
        emoji_count: number;         // Total emojis used
    }>;
    
    timeline: Array<{
        month: string;              // "YYYY-MM" format
        totalMessages: number;      // Messages this month
        peakDay: string;           // "YYYY-MM-DD" of busiest day
        activeParticipants: number; // Unique participants
    }>;
}
```

#### Error Responses

1. Chat not found:
```json
{
    "detail": "Chat with id {chat_id} not found",
    "status_code": 404
}
```

2. Invalid date format:
```json
{
    "detail": "Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)",
    "status_code": 400
}
```

3. Invalid time period:
```json
{
    "detail": "Invalid time period. Must be one of: Morning, Afternoon, Evening, Night, All Day",
    "status_code": 400
}
```

### Usage Examples with Fetch API

```typescript
// Basic request
const response = await fetch(`/api/dashboard/123`);
const data = await response.json();

// With filters
const params = new URLSearchParams({
    start_date: "2025-10-01T00:00:00Z",
    end_date: "2025-10-31T23:59:59Z",
    time_period: "Morning"
});
// Add multiple participants
params.append("participants", "John");
params.append("participants", "Alice");

const response = await fetch(`/api/dashboard/123?${params}`);
const data = await response.json();
```

### Usage Examples with Axios

```typescript
// Basic request
const response = await axios.get(`/api/dashboard/123`);

// With filters
const response = await axios.get(`/api/dashboard/123`, {
    params: {
        start_date: "2025-10-01T00:00:00Z",
        end_date: "2025-10-31T23:59:59Z",
        participants: ["John", "Alice"],
        time_period: "Morning"
    },
    paramsSerializer: params => {
        // Handles arrays properly
        return qs.stringify(params, { arrayFormat: 'repeat' })
    }
});
```

## Model Changes

### Message Model Updates (models.py)
Added new analytics fields to the Message model:

```python
word_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
emojis_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
links_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
is_question: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
is_media: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
```

## Schema Updates (schemas.py)

1. Added analytics fields to MessageBase schema
2. Created new schemas for dashboard data:
   - DashboardFilters
   - ParticipantActivity
   - SparklinePoint
   - Enhanced DashboardData with proper typing

## Analytics Implementation

Created a new utility (message_analytics.py) that computes message analytics during ingestion:

1. word_count: Splits by whitespace and counts non-empty words
2. emojis_count: Uses Unicode ranges to detect emojis
3. links_count: Uses regex to find URLs
4. is_question: Detects question marks and question words
5. is_media: Checks for media indicators in message content

## Query Implementation (dashboard.py)

The dashboard implementation uses efficient SQLAlchemy queries with:

1. **Date Range Filtering**
   - Uses SQLAlchemy's between() for date ranges
   - Properly handles timezone-aware timestamps

2. **Time Period Filtering**
   - Implements morning/afternoon/evening/night filtering
   - Uses CASE statements for hour ranges

3. **Dynamic Time Aggregation**
   - ≤ 60 days: Daily aggregation
   - 61-365 days: Weekly aggregation
   - > 365 days: Monthly aggregation

4. **Efficient Aggregations**
   - Uses func.count, func.sum for metrics
   - Implements GROUP BY for time series
   - Uses subqueries for complex calculations

5. **Performance Optimizations**
   - Uses DISTINCT for unique counts
   - Implements proper indexing on timestamp and participant columns
   - Minimizes subquery usage

## Key Components

1. **KPI Metrics**
   - Single query for total messages, active participants, and days
   - Efficient average calculation using window functions

2. **Time Series Data**
   - Dynamic time bucketing based on date range
   - Uses date_trunc for proper aggregation

3. **Activity Analysis**
   - Day of week distribution
   - Hourly activity patterns
   - Participant contribution analysis

4. **Timeline Generation**
   - Monthly aggregation
   - Includes message counts and active participants

## Usage Notes

1. **Database Indexing**
   The following indexes are required:
   ```sql
   CREATE INDEX idx_messages_timestamp ON messages(timestamp);
   CREATE INDEX idx_messages_participant_id ON messages(participant_id);
   CREATE INDEX idx_messages_chat_id ON messages(chat_id);
   ```

2. **Query Parameters**
   - start_date: Start of date range
   - end_date: End of date range
   - participants: List of participant names to filter
   - time_period: Morning/Afternoon/Evening/Night/All Day

## Future Improvements

1. Implement Redis caching for frequently accessed data
2. Create materialized views for common aggregations
3. Add pagination for large datasets
4. Implement more sophisticated activity metrics
5. Add error handling for edge cases