import * as nodemailer from 'nodemailer';

console.log('Nodemailer object type:', typeof nodemailer);
console.log('Nodemailer keys:', Object.keys(nodemailer));
console.log('Has createTransporter?', 'createTransporter' in nodemailer);
console.log('Full object:', nodemailer);
