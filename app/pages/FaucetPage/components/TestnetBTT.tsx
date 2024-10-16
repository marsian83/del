import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function TestnetBTT() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const navigate = useNavigate();

  const handleRequest = async () => {
    if (!address) {
      setResponseMessage("Please enter a valid address.");
      return;
    }

    setLoading(true);
    setResponseMessage("");

    try {
      const response = await fetch(
        `https://testfaucetapi.bt.io/transferbttc?address=${address}&token=btt`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        await response.json();
        toast.success("Success! You've received 10M BTTC.");
        navigate(0);
      } else {
        setResponseMessage("Failed to request BTTC. Please try again later.");
        toast.error("Failed to request BTTC. Please try again later.");
      }
    } catch (error) {
      setResponseMessage("Error occurred. Please try again.");
      toast.error("Error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-y-4">
      <div className="flex flex-col items-center gap-y-2 rounded-[2rem] bg-foreground p-8">
        <h3>Enter your wallet address</h3>
        <p className="text-sm text-slate-400">
          You can claim 10 Million BTTC every 24 hours
        </p>

        <div className="relative my-4">
          <input
            type="text"
            name="address"
            placeholder="0x..."
            id="address"
            className="w-[42.8ch] rounded-lg bg-front/20 px-3 py-1 text-front"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <button
          className="rounded-md bg-front/60 px-5 py-2 text-black duration-300 hover:-translate-y-1 hover:scale-[102%] hover:bg-front hover:shadow-lg active:translate-y-1 active:scale-75 disabled:pointer-events-none disabled:opacity-50"
          onClick={handleRequest}
          disabled={loading}
        >
          {loading ? (
            <figure className="h-5 w-5 animate-spin rounded-full border-2 border-dashed border-white" />
          ) : (
            "Request"
          )}
        </button>

        {responseMessage && (
          <p className="mt-4 text-sm text-white">{responseMessage}</p>
        )}
      </div>
    </div>
  );
}
