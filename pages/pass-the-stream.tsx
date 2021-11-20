import type { NextPage } from "next";
import type { IPTSTimeSlot } from "db";
import moment from "moment";
import axios from "axios";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  ExpandMoreIcon
} from "components";


const APP_URL = process?.env.NEXT_PUBLIC_APP_URL?.toString() ?? "";

type Props = {
  timeSlots: IPTSTimeSlot[]
};

const PassTheStream: NextPage<Props> = ({ timeSlots }) => {
  const timeSlotList = timeSlots.map((timeSlot, index) => {
    const startTime = moment(new Date(timeSlot.startTime));
    const endTime = moment(new Date(timeSlot.endTime));
    const startTimeText = <>
      <Box sx={{color: "success.dark"}}>{startTime.format("MM/D")}</Box>
      <Box sx={{fontWeight: "bold", color: "success.light" }}>{startTime.format("h a")}</Box>
    </>;
    const endTimeText = <>
      <Box sx={{color: "success.dark"}}>{endTime.format("MM/D")}</Box>
      <Box sx={{fontWeight: "bold", color: "success.light" }}>{endTime.format("h a")}</Box>
    </>;
    return (
      <Accordion key={timeSlot.id} square={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ mt: 0.5 }}>
          <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%"
          }}>

            <Box sx={{
              textAlign: "center",
            }}>{startTimeText}</Box>

            <Box sx={{
              textAlign: "center",
              width: 150,
              color: "text.secondary",
            }}>to</Box>

            <Box sx={{
              textAlign: "center",
            }}>{endTimeText}</Box>

          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Divider />
          <Box sx={{maxWidth: "600px", m: "auto"}}>
            <Box sx={{
              display: "flex",
              mt: 5
            }}>
              <Box sx={{color: "text.secondary", width: "100px", textAlign: "right"}}>
                Scheduled:
              </Box>
              <Box sx={{ml: 1, width: "75%"}}>
                <Chip sx={{ ml: 1, backgroundColor: "#030", border: "solid 1px", borderColor: "success.dark" }} label={<><Avatar sx={{display: "inline-block", verticalAlign: "middle", mr: 1, width: 45, height: 45, border: "solid 2px", borderColor: "success.light" }} src="https://cdn.discordapp.com/avatars/251192242834767873/5094265c229f1aa6502785dd8238ae58.png" /> ChevCast</>} onDelete={() => {}} variant="outlined" />
              </Box>
            </Box>
            <Box sx={{
              mt: 3,
              display: "flex"
            }}>
              <Box sx={{color: "text.secondary", width: "100px", textAlign: "right"}}>
                Backups:
              </Box>
              <Box sx={{ml: 1, width: "75%"}}>
                <Chip sx={{ ml: 1, backgroundColor: "#330", border: "solid 1px #770", m: 0.5 }} label="HarlequinDollface" onDelete={() => {}} variant="outlined" />
                <Chip sx={{ ml: 1, backgroundColor: "#330", border: "solid 1px #770", m: 0.5 }} label="MeantToBri" onDelete={() => {}} variant="outlined" />
                <Chip sx={{ ml: 1, backgroundColor: "#330", border: "solid 1px #770", m: 0.5 }} label="Ember_Stone" onDelete={() => {}} variant="outlined" />
                <Chip sx={{ ml: 1, backgroundColor: "#330", border: "solid 1px #770", m: 0.5 }} label="Alopex_Art" onDelete={() => {}} variant="outlined" />
                <Chip sx={{ ml: 1, backgroundColor: "#330", border: "solid 1px #770", m: 0.5 }} label="SithLordBoris" onDelete={() => {}} variant="outlined" />
                <Chip sx={{ ml: 1, backgroundColor: "#330", border: "solid 1px #770", m: 0.5 }} label="RheasRags" onDelete={() => {}} variant="outlined" />
              </Box>
            </Box>
            <Box sx={{display: "flex", justifyContent: "space-around", mt: 5}}>
              <Button variant="contained" color="success">RSVP!</Button>
              {/* <Button variant="contained" color="info">RSVP as a backup</Button> */}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  });

  return <Box sx={{color: "success.dark"}}>{timeSlotList}</Box>;
};

export async function getServerSideProps() {
  const { data: timeSlots } = await axios.get<IPTSTimeSlot[]>(`${APP_URL}/api/time-slots`);
  return { props: { timeSlots } };
}

export default PassTheStream;