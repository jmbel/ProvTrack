// app.js

const express = require('express');
const bodyParser = require('body-parser');
const csv = require('csv-parser');
const fs = require('fs');
const request = require('request');
const mysql = require('mysql');
const app = express();

// create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'database_name'
});

// use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// define a route to handle the form submission
app.post('/submit', (req, res) => {
  const { urls, sqlCode } = req.body; // extract form data

  // download CSV files and store them to disk
  const csvFiles = [];
  urls.forEach((url, index) => {
    request(url)
      .pipe(fs.createWriteStream(`data${index}.csv`))
      .on('finish', () => {
        // parse the CSV file and store the data in memory
        const data = [];
        fs.createReadStream(`data${index}.csv`)
          .pipe(csv())
          .on('data', (row) => {
            data.push(row);
          })
          .on('end', () => {
            // create a new table in the MySQL database for this CSV file
            const tableName = `table${index}`;
            const createTableQuery = `CREATE TABLE ${tableName} (id INT PRIMARY KEY, name VARCHAR(255))`;
            connection.query(createTableQuery, (err, results) => {
              if (err) throw err;

              // insert the data into the MySQL database table
              const insertQuery = `INSERT INTO ${tableName} (id, name) VALUES ?`;
              const values = data.map((row) => [row.id, row.name]);
              connection.query(insertQuery, [values], (err, results) => {
                if (err) throw err;
              });
            });
          });
      });
    csvFiles.push(`data${index}.csv`);
  });

  // execute the submitted SQL code on the MySQL database
  connection.query(sqlCode, (err, results) => {
    if (err) throw err;

    // save the form data to a version-controlled file
    fs.appendFile('form_data.txt', `${urls.join(',')}\n${sqlCode}\n`, (err) => {
      if (err) throw err;

      // send a response to the client
      res.send('Form submitted successfully!');
    });
  });
});

// start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
