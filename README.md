# ProvTrack

A data retrieval system that tracks data provenance and transformations.

Initial app skeleton (v.1):
- Using submitted URLs of web-accessible static datasets (in CSV format), download those datasets.
- Store the downloaded data into a local MySQL database, one table per dataset.
- Execute submitted SQL code on the created database.
- Save all submitted instructions to a version-controlled file (i.e., CSV file URLs and SQL code).

## License
This project is licensed under the [ISC](https://en.wikipedia.org/wiki/ISC_license) open-source license.
