//run "nvm install v22.14.0" in command line to run latest version of node

import fs from 'fs';
import { parse } from 'csv-parse';
import _ from 'lodash';
import { Parser as j2csv } from "json2csv";

Promise.all([
    readRawData("2013-2023.csv"),
    readRawData("2020.csv")
])
.then(([data1, data2]) => {

        console.log("First Dataset:", data1.length);
        console.log("Second Dataset:", data2.length);

        //DATA ANALYSIS

        //1. use the       //  2013-2023 data set to a. split into data by year, b. compute average by year

        //2. use the 2013-2023 data set to a. split into countries b. compute average by country

        //3. Use individual 2020 and 2022 data, find 
        // a. countries that were removed from 2020 dataset 
        // b. countries that were added in 2022 dataset
        
})
.catch(error => {
    console.error("Error reading CSV files:", error);
});

async function readData(filePath,e) {
    try {
        const csvData = await readRawData(filePath);
        e(csvData)
    } catch (error) {
        console.error("Error reading CSV:", error);
    }


}

async function readRawData(filePath) {

    return new Promise((resolve, reject) => {
        let entries = [];
        let headers = [];

        fs.createReadStream(filePath)
            .pipe(parse({ delimiter: ',' }))
            .on('data', function (row) {
                if (headers.length === 0) {
                    headers = row.map(header => header.trim()); // Store headers

                } 
                let entry = Object.fromEntries(headers.map((key, i) => [key, row[i] || ""]));
                entries.push(entry);
            })
            .on('end', function () {
                resolve(entries);
            })
            .on('error', function (error) {
                reject(error);
            });
    });
}

function findChanges(arr1, arr2, key = 'name') {
    const removed = _.differenceBy(arr1, arr2, key); // Objects in arr1 but not in arr2
    const added = _.differenceBy(arr2, arr1, key); // Objects in arr2 but not in arr1
    
    // Find common objects where some properties changed
    const modified = _.intersectionBy(arr1, arr2, key)
        .map(obj1 => {
            const obj2 = _.find(arr2, { [key]: obj1[key] }); // Find corresponding object in arr2
            if (!_.isEqual(obj1, obj2)) {
                return {
                    id: obj1[key], // Unique identifier
                    changes: _.reduce(obj1, (result, value, prop) => {
                        if (!_.isEqual(value, obj2[prop])) {
                            result[prop] = { from: value, to: obj2[prop] }; // Track value changes
                        }
                        return result;
                    }, {})
                };
            }
        })
        .filter(Boolean); // Remove undefined entries (objects that are identical)

    return { removed, added, modified };
}