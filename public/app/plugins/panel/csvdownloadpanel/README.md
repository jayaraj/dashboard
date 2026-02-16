# CSV Download Panel

A Grafana panel plugin for downloading large datasets as CSV files with pagination support.

## Features

- Download large datasets from grafoservice datasource
- Automatic pagination (iterates from page 1 to n until empty records are received)
- Configurable page size (default: 200 records per page)
- Progress indicator during download
- Excel-compatible header option
- Custom filename support
- Custom query arguments

## Configuration Options

### Panel Settings

| Option            | Description                              | Default        |
| ----------------- | ---------------------------------------- | -------------- |
| Button Heading    | Text displayed on the download button    | "Download CSV" |
| File Name         | Name for the downloaded CSV file         | "export"       |
| Use Excel Header  | Use Excel-compatible header format       | false          |
| Records Per Page  | Number of records to fetch per page      | 200            |
| Data Source       | Select the grafoservice datasource       | -              |
| Query Application | Application name for the query           | -              |
| Query API         | API name for the query                   | -              |
| Query Arguments   | Additional key-value pairs for the query | -              |

## How It Works

1. When the download button is clicked, the plugin starts fetching data from page 1
2. It continues to fetch subsequent pages until:
   - Empty records are received (indicating no more data)
   - Or 2 consecutive empty pages are encountered
3. All fetched data is combined into a single DataFrame
4. The combined data is converted to CSV format
5. The CSV file is downloaded to the client's browser

## Pagination Arguments

The plugin automatically adds these pagination arguments to each query:

- `page`: Current page number (1, 2, 3, ...)
- `perPage`: Number of records per page (configurable, default 200)

Your grafoservice API endpoint should support these parameters to return paginated results.

## Example Query Arguments

You can add additional query arguments in the panel options:

- `key`: "status", `value`: "active"
- `key`: "type", `value`: "user"

These will be sent along with the pagination parameters.

## Safety Limits

- Maximum pages: 10,000 (to prevent infinite loops)
- Maximum records: 2,000,000 (with 200 per page × 10,000 pages)

## Requirements

- Grafana 10.0.3 or later
- grafoservice datasource plugin configured

## Author

Grafo - https://grafo.live
