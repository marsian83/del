import { useEffect, useState } from "react";
import DocTitle from "../../common/DocTitle";
import { twMerge } from "tailwind-merge";
import api from "../../utils/api";
import DataForm from "../../common/DataForm";
import { useAccount, useSignMessage } from "wagmi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { extractErrorFromTx } from "../../utils";

export default function NewMarketerPage() {
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(
    "https://res.cloudinary.com/dqjkucbjn/image/upload/v1726786874/logo_ipjrnu.png",
  );
  const { address } = useAccount();
  const navigate = useNavigate();

  const { signMessage, data: sign, error } = useSignMessage();
  const [data, setData] = useState<{
    name: string;
    imageUrl: string;
  }>({
    name: "",
    imageUrl:
      "https://res.cloudinary.com/dqjkucbjn/image/upload/v1726786874/logo_ipjrnu.png",
  });

  useEffect(() => {
    if (data && sign && address) {
      console.log("useEffect called");
      api.user
        .becomeMarketer(data, sign, address)
        .then((result) => {
          toast.success("Registered as a marketer...");
          navigate(0);
        })
        .catch((error) => {
          console.error(error);
          if (error.response?.data?.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error("An error occured, please try again");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }

    if (error) {
      const errorMsg = extractErrorFromTx(error.message);
      toast.error(errorMsg, {
        autoClose: 2000,
      });
      setLoading(false);
    }
  }, [sign, error]);

  return (
    <>
      <DocTitle title="Register to sell Policies" />

      <DataForm
        callback={async (formData) => {
          setLoading(true);

          try {
            if (!address) return toast.error("Connect Wallet first");

            const nonce = await api.user.requestNonce(address);
            signMessage({
              message: `${JSON.stringify({
                name: formData.name,
                imageUrl: formData?.imageUrl || "",
              })}${nonce}`,
            });
            setData({
              name: formData.name,
              imageUrl: formData?.imageUrl || "",
            });

            toast.info("Sign the message to continue...");
          } catch (error) {
            setLoading(false);
            console.error(error);
            toast.error("An error occured, please try again");
          }
        }}
        className="p-page flex flex-col gap-y-4"
      >
        <div className="mt-6 flex gap-x-16 mobile:gap-x-4">
          <div className="flex basis-3/4 flex-col gap-y-6">
            <div className="flex flex-col gap-y-1">
              <h1 className="text-sm text-front/80">Marketer Name</h1>
              <input
                className="rounded-lg border border-front/20 bg-background px-3 py-3 focus-within:outline-none"
                placeholder="What name would you want to be known as"
                name="name"
                required
              />
            </div>
            <div className="flex flex-col gap-y-1">
              <h1 className="text-sm text-front/80">Logo</h1>
              <input
                type="url"
                name="imageUrl"
                defaultValue={logo}
                className="rounded-lg border border-front/20 bg-background px-3 py-3 focus-within:outline-none"
                placeholder="Provide logo url"
                onChange={(e) => setLogo(e.target.value)}
              />
            </div>

            <div className="">
              <input
                type="submit"
                className="cursor-pointer rounded-md bg-secondary px-6 py-2 disabled:animate-pulse disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
                value="Confirm"
              />
            </div>
          </div>
          <div
            className={twMerge(
              "flex aspect-square basis-1/4 items-center justify-center rounded-xl bg-secondary/20 mobile:basis-1/2",
              !logo && "animate-pulse",
            )}
          >
            <img
              src={logo}
              onError={(e) => {
                e.currentTarget.src = "";
                setLogo(e.currentTarget.src);
              }}
              draggable={false}
              className="h-full w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </DataForm>
    </>
  );
}
