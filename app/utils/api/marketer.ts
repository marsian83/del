import { client } from ".";
import { User } from "../../types";

const marketer = {
  async get(address: string) {
    const response = await client.get<{ marketer: User }>(
      `/user/get/${address}`,
    );
    const data = response.data;
    return data;
  },
};

export default marketer;
