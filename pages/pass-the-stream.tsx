import { useState } from "react";
import type { NextPage } from "next";
import moment from "moment";
import axios from "axios";
import produce from "immer";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAppState } from "hooks/useAppState";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  ExpandMoreIcon,
  TwitchIcon
} from "components";

const APP_URL = process?.env.NEXT_PUBLIC_APP_URL?.toString() ?? "";

type TwitchUser = {
  id: string,
  avatar: string,
  username: string
}

type TimeSlot = {
  id: string,
  startTime: string,
  endTime: string,
  RSVP?: TwitchUser,
  backupRSVPs?: TwitchUser[]
}

type Props = {
  timeSlots: TimeSlot[]
};

const PassTheStream: NextPage<Props> = (props) => {
  const [timeSlots, setTimeSlots] = useState(props.timeSlots);
  const theme = useTheme();
  const smDownBreakpoint = useMediaQuery(theme.breakpoints.down("md"));
  const { state, dispatch } = useAppState();
  const { user } = state;

  const register = async (timeSlot: TimeSlot) => {
    try {
      if (!user || !user.twitchId) {
        window.location.assign(`/api/auth/twitch-login?redirectUrl=${APP_URL}/api/pts/rsvp/${timeSlot.id}`);
      } else {
        const { data: twitchUser } = await axios.post<TwitchUser>(`/api/pts/rsvp/${timeSlot.id}`);
        setTimeSlots(produce(timeSlots, draft => {
          const timeSlotToUpdate = draft.find(ts => ts.id === timeSlot.id);
          if (!timeSlotToUpdate) throw new Error(`Unable to find time slot with ID ${timeSlot.id}`);
          timeSlotToUpdate.RSVP = twitchUser;
        }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const registerBackup = async (timeSlot: TimeSlot) => {
    try {
      if (!user || !user.twitchId) {
        window.location.assign(`/api/auth/twitch-login?redirectUrl=${APP_URL}/api/pts/rsvp-backup/${timeSlot.id}`);
      } else {
        if (timeSlot.RSVP?.id === user.userId || timeSlot.backupRSVPs?.map(user => user.id).includes(user.userId)) {
          dispatch("OPEN_ERROR", {
            type: "Custom",
            title: "Unable to Register",
            description: "You already volunteered as tribute. You can't do it twice!"
          });
          return;
        }
        const { data: twitchUser } = await axios.post<TwitchUser>(`/api/pts/rsvp-backup/${timeSlot.id}`);
        setTimeSlots(produce(timeSlots, draft => {
          const timeSlotToUpdate = draft.find(ts => ts.id === timeSlot.id);
          if (!timeSlotToUpdate) throw new Error(`Unable to find time slot with ID ${timeSlot.id}`);
          if (!timeSlotToUpdate.backupRSVPs) timeSlotToUpdate.backupRSVPs = [];
          timeSlotToUpdate.backupRSVPs.push(twitchUser);
        }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const unregister = async (timeSlot: TimeSlot) => {
    await axios.delete(`/api/pts/unregister/${timeSlot.id}`);
    setTimeSlots(produce(timeSlots, draft => {
      const timeSlotToUpdate = draft.find(ts => ts.id === timeSlot.id);
      if (!timeSlotToUpdate) throw new Error(`Unable to find time slot with ID ${timeSlot.id}`);
      delete timeSlotToUpdate.RSVP;
    }));
  };

  const unregisterBackup = async (timeSlot: TimeSlot) => {
    await axios.delete(`/api/pts/unregister-backup/${timeSlot.id}`);
    setTimeSlots(produce(timeSlots, draft => {
      const timeSlotToUpdate = draft.find(ts => ts.id === timeSlot.id);
      if (!timeSlotToUpdate) throw new Error(`Unable to find time slot with ID ${timeSlot.id}`);
      const index = timeSlotToUpdate.backupRSVPs?.findIndex(u => u.id === user?.userId);
      if (index === undefined) return;
      timeSlotToUpdate.backupRSVPs?.splice(index, 1);
    }));
  };

  const timeSlotList = timeSlots.map(timeSlot => {
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
      <Accordion key={timeSlot.id} square={smDownBreakpoint}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ mt: 0.5 }}>
          <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "calc(100% - 15rem)"
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
          <Box sx={{
            mr: 2,
            width: "15rem",
            textAlign: "right",
            overflow: "hidden",
            position: "relative"
          }}>
            { timeSlot.backupRSVPs &&
              timeSlot.backupRSVPs.reverse().map((twitchUser, index) => ( 
                <>
                  <Avatar src={twitchUser.avatar} sx={{
                    position: "absolute",
                    right: ((timeSlot.backupRSVPs!.length - index) * 30),
                    width: 40,
                    height: 40,
                    border: "solid 1px",
                    borderColor: "warning.dark",
                  }} />
                  <Box sx={{
                    position: "absolute",
                    right: ((timeSlot.backupRSVPs!.length - index) * 30),
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    backgroundColor: "warning.dark",
                    opacity: 0.3
                  }} />
                </>
              ))
            }
            { timeSlot.RSVP && 
              <Avatar src={timeSlot.RSVP.avatar} sx={{
                position: "absolute",
                right: 0,
                width: 40,
                height: 40,
                border: "solid 2px",
                borderColor: "success.dark"
              }} />
            }
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Divider />
          <Box sx={{maxWidth: "850px", m: "auto"}}>
            <Box sx={{
              display: "flex",
              mt: 5
            }}>
              <Box sx={{color: "text.secondary", width: "100px", textAlign: "right"}}>
                Scheduled:
              </Box>
              <Box sx={{ml: 1, width: "75%"}}>
                { timeSlot.RSVP ?
                  <Chip
                    sx={{
                      ml: 1,
                      backgroundColor: "#030",
                      border: "solid 1px",
                      borderColor: "success.dark",
                      "&:hover": {
                        backgroundColor: "#050 !important"
                      }
                    }}
                    label={
                      <>
                        <Avatar
                          sx={{
                            display: "inline-block",
                            verticalAlign: "middle",
                            mr: 1,
                            width: 40,
                            height: 40,
                            border: "solid 2px",
                            borderColor: "success.light",
                            cursor: "pointer"
                          }}
                          onClick={() => window.location.assign(`https://twitch.tv/${timeSlot.RSVP!.username}`)}
                          src={timeSlot.RSVP.avatar}
                        />
                        { timeSlot.RSVP.username }
                      </>
                    }
                    onDelete={timeSlot.RSVP.id === user?.userId ? () => unregister(timeSlot) : undefined}
                    variant="outlined"
                  /> :
                  <span>No one has signed up for this window yet.</span>
                }
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
                { timeSlot.backupRSVPs && timeSlot.backupRSVPs.length > 0 ?
                  timeSlot.backupRSVPs.map(twitchUser => <Chip
                    key={twitchUser.id}
                    sx={{
                      ml: 1,
                      backgroundColor: "#330",
                      border: "solid 1px",
                      borderColor: "warning.dark",
                      m: 1,
                      "&:hover": {
                        backgroundColor: "#550 !important"
                      }
                    }}
                    label={
                      <>
                        <Avatar
                          sx={{
                            display: "inline-block",
                            verticalAlign: "middle",
                            mr: 1,
                            width: 40,
                            height: 40,
                            border: "solid 2px",
                            borderColor: "warning.light",
                            cursor: "pointer"
                          }}
                          onClick={() => window.location.assign(`https://twitch.tv/${twitchUser.username}`)}
                          src={twitchUser.avatar}
                        />
                        { twitchUser.username }
                      </>
                    }
                    onDelete={twitchUser.id === user?.userId ? () => unregisterBackup(timeSlot) : undefined}
                    variant="outlined"
                  />) :
                  <span>No one has signed up as a backup for this window yet.</span>
                }
              </Box>
            </Box>
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              alignItems: "center",
              mt: 6,
              mb: 3
            }}>
              { !timeSlot.RSVP &&
                (!user || !timeSlot.backupRSVPs?.map(user => user.id).includes(user.userId)) &&
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<TwitchIcon sx={{ width: 25, height: 25, mr: 1 }} color="#030" />}
                  onClick={() => register(timeSlot)}
                  sx={{
                    color: "#030",
                    fontWeight: "bold",
                    width: 300,
                    mb: 2
                  }}
                >Sign Me Up!</Button>
              }
              { (!timeSlot.RSVP || !user || timeSlot.RSVP.id !== user.userId) &&
                (!user || !timeSlot.backupRSVPs?.map(user => user.id).includes(user.userId)) &&
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<TwitchIcon sx={{ width: 25, height: 25, mr: 1 }} color="#030" />}
                  onClick={() => registerBackup(timeSlot)}
                  sx={{
                    color: "#030",
                    fontWeight: "bold",
                    width: 300
                  }}
                >Volunteer as a Backup</Button>
              }
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  });

  return <Box sx={{
    [theme.breakpoints.up("md")]: {
      maxWidth: "850px",
      m: "1rem auto 1rem auto"
    }
  }}>{timeSlotList}</Box>;
};

export async function getServerSideProps() {
  const { data: timeSlots } = await axios.get<TimeSlot[]>(`${APP_URL}/api/pts/time-slots`);
  return { props: { timeSlots } };
}

export default PassTheStream;