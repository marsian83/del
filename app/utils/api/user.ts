import { client } from ".";
import { User } from "../../types";

const user = {
  async check(address: string) {
    const response = await client.get<{ exists: boolean }>(
      `/user/check/${address}`,
    );
    return response.data;
  },

  async createUser(address: string) {
    const response = await client.post<{ user: User }>(`/user/create`, {
      address,
    });
    return response.data;
  },

  async requestNonce(address: string) {
    const response = await client.post<{ nonce: string }>(
      "/user/request-nonce",
      {
        address,
      },
    );

    const data = response.data;
    return data.nonce;
  },

  async fetchPolicyHolders(address: string) {
    const response = await client.get(`/user/holders/${address}`);
    return response.data;
  },

  async get(address: string) {
    const result = await client.get<{ user: User }>(`/user/get/${address}`);

    return result.data.user;
  },

  async becomeMarketer(
    data: { name: string; imageUrl: string },
    sign: string,
    address: string,
  ) {
    const response = await client.post("/user/become-marketer", {
      data,
      sign,
      address,
    });
    return response.data;
  },
};

export default user;
