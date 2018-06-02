#!/usr/bin/env node

const request = require('request');
const cheerio = require('cheerio');
const Table = require('cli-table');
const yargs = require('yargs');
const fs = require('fs');

const argv = yargs
    .options({
        o: {
            alias: 'option',
            describe: 'Latest, Popular or search?',
            type: 'string',
            demand: true,
            defaut: 'latest'
        },
        i: {
            demand: false,
            alias: 'item',
            describe: 'Item Name',
            string:true
        }
    })
    .help()
    .alias('help', 'h')
    .argv;

let table = new Table({
    head: ['Ad Title', 'Price', 'Condition'],
    colWidths: [60, 20, 20]
})

const fetch = (url) => {
    let data = [];
    return new Promise((resolve, reject) => {
        request(url, (err, response, body) => {
            if(err)
                reject(err);
            const $ = cheerio.load(body);
            let x = $($('#dblue').parent());
            let y = $(x).children();
            for (var i = 10; i < y.length - 2; i++) {
                let details = $($(y[i]).find('td')[2]);
                let name =   $($(details).find('font')[0]).text();
                let seller = $($(details).find('a')[1]).text();
                let address = $($(details).find('font')[2]).text().replace(' - ','');
                let date = $($(y[i]).find('td')[3]).text();
                let status = $($(y[i]).find('td')[4]).text().split('(');
                let price = status[0];
                let condition = status.length == 2 ? status[1].replace(')','') : '-';
                let link = 'http://hamrobazaar.com/' + $($(details).find('a')[0]).attr('href');
                data.push({
                    name, seller, address, price, date, link, condition
                });
            }
            resolve(data);
        });
    });
};

const search = (query) => {
    console.log('Searching', query)
    const searchUrl = 'http://hamrobazaar.com/search.php?do_search=Search&searchword=' + query;
    fetch(searchUrl).then((data) => print(data), (err) => console.log(err));
}

const popular = (offset) => {
    console.log('Finding Popular items')
    const popularUrl = 'http://hamrobazaar.com/mostviewed.php?&order=popularad&offset=' + offset*20;
    fetch(popularUrl).then((data) => print(data), (err) => console.log(err));
}

const latest = (offset) => {
    console.log('Finding Latest items')
    const latestUrl = 'http://hamrobazaar.com/latestfull.php';
    fetch(latestUrl).then((data) => print(data), (err) => console.log(err))
}

function print (data) {
    for (item of data) {
        table.push([item.name, item.price, item.condition]);            
    }
    console.log(table.toString())
}

const options = {
    'popular' : () => popular(0),
    'latest' : () => latest(0),
    'search' : (query) => search(query),
    '' : () => console.log('Pass in the argument')
}

options[argv['o']](argv['i'])