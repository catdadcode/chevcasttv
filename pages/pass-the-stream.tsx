import { useState, Fragment } from "react";
import type { NextPage } from "next";
import moment from "moment-timezone";
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
  Card,
  Chip,
  Collapse,
  Divider,
  ExpandMoreIcon,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TwitchIcon,
  Typography
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
  const [collapsed, setCollapsed] = useState(false);
  const [timeZone, setTimeZone] = useState(moment.tz.guess());
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
    const startTime = moment(new Date(timeSlot.startTime)).tz(timeZone);
    const endTime = moment(new Date(timeSlot.endTime)).tz(timeZone);
    const startTimeText = <>
      <Box sx={{color: "success.dark"}}>{startTime.format("MM/D")}</Box>
      <Box sx={{fontWeight: "bold", color: "success.light" }}>{startTime.format("h a z")}</Box>
    </>;
    const endTimeText = <>
      <Box sx={{color: "success.dark"}}>{endTime.format("MM/D")}</Box>
      <Box sx={{fontWeight: "bold", color: "success.light" }}>{endTime.format("h a z")}</Box>
    </>;
    return (
      <Accordion key={timeSlot.id} square={smDownBreakpoint}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ mt: 0.5 }}>
          <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "calc(100% - 5rem)"
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
            width: 300,
            [theme.breakpoints.down("md")]: {
              mr: 1,
              width: 100,
            },
            textAlign: "right",
            overflow: "hidden",
            position: "relative",
            verticalAlign: "middle"
          }}>
            { timeSlot.backupRSVPs &&
              [...timeSlot.backupRSVPs].reverse().map((twitchUser, index) => ( 
                <Fragment key={twitchUser.id}>
                  <Avatar src={twitchUser.avatar} sx={{
                    position: "absolute",
                    right: ((timeSlot.backupRSVPs!.length - index) * (smDownBreakpoint ? 15 : 30)),
                    top: "calc(50% - 20px)",
                    width: 40,
                    height: 40,
                    border: "solid 1px",
                    borderColor: "warning.dark",
                  }} />
                  <Box sx={{
                    position: "absolute",
                    right: ((timeSlot.backupRSVPs!.length - index) * (smDownBreakpoint ? 15 : 30)),
                    top: "calc(50% - 20px)",
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    backgroundColor: "warning.dark",
                    opacity: 0.3
                  }} />
                </Fragment>
              ))
            }
            { timeSlot.RSVP && 
              <Avatar src={timeSlot.RSVP.avatar} sx={{
                position: "absolute",
                right: 0,
                top: "calc(50% - 20px)",
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
              <Button
                disabled={timeSlot.RSVP !== undefined || (user && timeSlot.backupRSVPs?.map(u => u.id).includes(user.userId))}
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
              <Button
                disabled={ user && (timeSlot.backupRSVPs?.map(u => u.id).includes(user.userId) || timeSlot.RSVP?.id === user?.userId)}
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
  }}>
    <Card sx={{
      p: 1,
      m: "auto",
      mt: 2,
      mb: 3,
    }}>
      <Box sx={{p: 5, backgroundColor: "background.default"}}>
        <Collapse in={collapsed} collapsedSize={325}>
          <Typography variant="h3" sx={{
            textAlign: "center",
            fontFamily: "neon",
            color: "success.light",
            mb: 2
          }}>Pass The Stream!</Typography>
          <Typography variant="body1">
            ChevCast is sponsoring a Pass The Stream event! We're blocking out a 24 hour period and allowing streamers of all stripes to register to participate. Use the form below to register for your desired time window! 
          </Typography>
          <Divider sx={{mt: 2, mb: 2}} />
          <Typography variant="h4" sx={{
            fontFamily: "neon",
            color: "warning.light",
            mb: 1
          }}>What is it?</Typography>
          <Typography variant="body2">
            Pass The Stream is an event where streamers sign up to stream for portions of a given time period (often 24 hours). At the end of each streamer's scheduled window they will pass all their viewers along to the next person via <Link href="https://help.twitch.tv/s/article/how-to-use-raids?language=en_US">Twitch Raid.</Link>
          </Typography>
          <Divider sx={{mt: 2, mb: 2}} />
          <Typography variant="h4" sx={{
            fontFamily: "neon",
            color: "warning.light",
            mb: 1
          }}>When is it?</Typography>
          <Typography variant="body2">
            The next ChevCast sponsored Pass The stream event takes place from <span style={{fontWeight: "bold", color: theme.palette.success.dark}}>December 3rd at 7pm PST</span> to <span style={{fontWeight: "bold", color: theme.palette.success.dark}}>December 4th at 10pm PST.</span> (26 hours)
          </Typography>
          <Divider sx={{mt: 2, mb: 2}} />
          <Typography variant="h4" sx={{
            fontFamily: "neon",
            color: "warning.light",
            mb: 1
          }}>How do I sign up?</Typography>
          <Typography variant="body2">
            Simply scroll down and tap to expand the desired time window you'd like to stream. Each window is 1 hour long and you can register as the active streamer for up to 2 windows.
            <br />
            <br />
            If nobody has taken that window then you can claim it for yourself by tapping "Sign Me Up!" However, even if someone has taken a window you are still free to register as a backup.
            <br />
            These kinds of events a prone to cancellations; if you're eager to stream as much as possible then sign up as a backup as much as you like. There are no limits to the number of backup windows you sign up for!
          </Typography>
          <Divider sx={{mt: 2, mb: 2}} />
          <Typography variant="h4" sx={{
            fontFamily: "neon",
            color: "warning.light",
            mb: 1
          }}>How do I cancel?</Typography>
          <Typography variant="body2">
            When clicking sign up it will ask you to authenticate using your Twitch account. To modify your registration status simply login in the top right and select "Twitch" as your login method. You will then see little "X" buttons next to your name in the time window panels. Clicking those will remove your registration.
          </Typography>
        </Collapse>
      </Box>
      <Box sx={{textAlign: "center"}}>
        <IconButton color="primary" onClick={() => setCollapsed(!collapsed)}>
          <ExpandMoreIcon sx={{width: 50, height: 50, transform: `rotate(${collapsed ? 180 : 0}deg)`}} />
        </IconButton> 
      </Box>
    </Card>
    <Box>
      <FormControl>
        <InputLabel id="time-zone-label">Time Zone</InputLabel>
        <Select
          labelId="time-zone-label"
          value={timeZone}
          label="Time Zone"
          onChange={e => setTimeZone(e.target.value)}
        >
          { moment.tz.names().map(zone => <MenuItem key={zone} value={zone}>{zone}</MenuItem>) }
        </Select>
      </FormControl>
      {timeSlotList}
    </Box>
  </Box>;
};

export async function getServerSideProps() {
  const { data: timeSlots } = await axios.get<TimeSlot[]>(`${APP_URL}/api/pts/time-slots`);
  return { props: { timeSlots } };
}

export default PassTheStream;