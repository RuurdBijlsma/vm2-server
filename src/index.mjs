import ApiController from './ApiController';
import Database from "./Database";
import TitleFixer from "./TitleFixer";

setTimeout(async () => {
    // console.log("STARTING NOW");
    // await Database.reprocessYtTitles();
}, 2000);

ApiController.start(3000);