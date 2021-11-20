import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import debug from "debug";
import moment from "moment";
import { initialize, close, PTSTimeSlot } from "./index";

const log = debug("CHEVCASTTV:SEED-SCRIPT");

const main = async () => {

  await initialize();

  switch (process.argv[2]) {
    case "pts-time-slots": 
      log("Deleting all time slots...");
      await PTSTimeSlot.deleteMany();
      log("Done.");
      log("Creating time slots...");
      const totalHours = 24;
      const eventStartTime = moment("Fri, 03 Dec 2021 19:00:00 MST");
      for (let hour = 0; hour < totalHours; hour++) {
        const timeSlot = new PTSTimeSlot({
          startTime: moment(eventStartTime).add(hour, "hours").toDate(),
          endTime: moment(eventStartTime).add(hour + 1, "hours").toDate()
        });
        await timeSlot.save();
      }
      log("Done.");
      break;
  }

  await close();

};

main().catch(err => {
  close();
  console.log(err);
});