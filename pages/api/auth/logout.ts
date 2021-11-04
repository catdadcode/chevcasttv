import { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = new Cookies(req, res);
  cookies.set("session_token");
  res.send(null);
};

export default handler;