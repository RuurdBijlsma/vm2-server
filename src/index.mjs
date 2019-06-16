import ApiController from './ApiController.mjs';
import Database from "./Database.mjs";
import Commander from 'commander';

Commander
    .version('0.1.0')
    .option('-r, --reprocess', 'Reprocess song titles and artists using TitleFixer')
    .parse(process.argv);

if (Commander.reprocess)
    setTimeout(async () => {
        console.log("REPROCESSING NOW");
        await Database.reprocessYtTitles();
    }, 2000);

ApiController.start(3000);
