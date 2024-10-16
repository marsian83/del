import React, { useEffect, useReducer, useRef, useState } from "react";
import DocTitle from "../../common/DocTitle";
import Heading from "./components/Heading";
import useModal from "../../hooks/useModal";
import TexteditorModal from "./components/TexteditorModal";
import ArgsTypeDefine from "./components/ArgsTypeDefine";
import insuranceCategories from "../../assets/data/insuranceCategories";
import { twMerge } from "tailwind-merge";
import ToastsInput from "../../common/ToastsInput";
import DurationInput from "../../common/DurationInput";
import DataForm from "../../common/DataForm";
import api from "../../utils/api";
import { useAccount, useSignMessage } from "wagmi";
import { useNavigate } from "react-router-dom";
import Icon from "../../common/Icon";
import { toast } from "react-toastify";
import { Arg } from "../../types";
import { extractErrorFromTx } from "../../utils";

export default function NewPolicyPage() {
  const twInputStyle =
    "text-lg rounded-md p-2 bg-background border border-border shadow shadow-mute/30";

  const modal = useModal();

  const { address } = useAccount();
  const [premiumFunc, setPremiumFunc] = useState("");
  const [premiumFuncArgs, setPremiumFuncArgs] = useState<Array<string>>([]);
  const [claimFunc, setClaimFunc] = useState("");
  const [claimFuncArgs, setClaimFuncArgs] = useState<Array<string>>([]);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [premiumFuncArgsSetter, setPremiumFuncArgsSetter] = useState<Arg[]>([]);
  const [claimFuncArgsSetter, setclaimFuncArgsSetter] = useState<Arg[]>([]);
  const [manualPremiumCheck, setManualPremiumCheck] = useState(false);
  const [manualClaimCheck, setManualClaimCheck] = useState(false);
  const [logo, setLogo] = useState(
    "https://res.cloudinary.com/dqjkucbjn/image/upload/v1726786874/logo_ipjrnu.png",
  );

  const {
    signMessage,
    data: nonceData,
    isSuccess: nonceSuccess,
    isError: nonceError,
    error: nonceErrorData,
  } = useSignMessage();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>();
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    const handleSubmitToast = toast("Sign the message to proceed..", {
      type: "info",
      isLoading: false,
      autoClose: 2000,
    });

    try {
      setFormData({
        ...data,
        premiumFuncArgs: premiumFuncArgsSetter,
        claimFuncArgs: claimFuncArgsSetter,
        creator: address,
        tags,
      });
      const nonce = await api.policy.requestNonce(`${address}`);
      signMessage({
        message: `${JSON.stringify({
          ...data,
          premiumFuncArgs: premiumFuncArgsSetter,
          claimFuncArgs: claimFuncArgsSetter,
          creator: address,
          tags,
        })}${nonce}`,
      });
    } catch (error) {
      toast.update(handleSubmitToast, {
        render: "Something went wrong..",
        type: "error",
        autoClose: 2000,
      });
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    async function submitForm() {
      try {
        const reqBody = {
          data: formData,
          sign: nonceData,
        };
        await api.policy.createNewPolicy(reqBody);
        setLoading(false);
        toast.success("Policy created Successfully..", {
          type: "success",
          autoClose: 2000,
        });
        navigate("/dashboard");
      } catch (error: any) {
        setLoading(false);
        console.error(error);
        if (error.response.data.message) {
          toast.error(error.response.data.message, {
            type: "error",
            autoClose: 2000,
          });
        } else {
          toast.error("Failed to create policy..", {
            type: "error",
            autoClose: 2000,
          });
        }
      }
    }

    if (nonceData && nonceSuccess) {
      toast.success("Transaction Submitted..", {
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      submitForm();
    }

    if (nonceError) {
      setLoading(false);
      const errorMsg = extractErrorFromTx(nonceErrorData.message);
      toast.error(errorMsg, {
        type: "error",
        autoClose: 2000,
      });
    }
  }, [nonceData, nonceSuccess, nonceError, nonceErrorData]);

  return (
    <>
      <DocTitle title="New Policy" />

      <div className="p-page overflow-x-hidden">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="flex animate-pulse flex-col items-center rounded-lg border border-border bg-zinc-200 p-8">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-0 border-primary" />
              <p className="mt-2 font-semibold text-primary">Creating Policy</p>
              <p className="text-mute">Please wait...</p>
            </div>
          </div>
        )}

        <section className="py-8">
          <DataForm className="flex flex-col" callback={handleSubmit}>
            <h1 className="text-xl font-semibold">Create New Policy</h1>
            <h2 className="font-semibold text-mute">
              Fill in the details to create a new policy
            </h2>

            <Heading className="mt-4">Basic Details</Heading>
            <div className="mt-2 flex justify-between gap-10 rounded-xl border border-border p-4">
              <div className="flex w-full flex-col">
                <div className="flex flex-col gap-2">
                  <Heading className="">Policy Logo</Heading>
                  <input
                    type="url"
                    name="image"
                    className="rounded-lg border border-front/20 bg-background px-3 py-3 focus-within:outline-none"
                    placeholder="Provide logo url"
                    defaultValue={logo}
                    onChange={(e) => setLogo(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Heading className="mt-4">Name of insurance</Heading>
                  <input
                    required
                    type="text"
                    name="name"
                    className={twInputStyle}
                    placeholder="Enter Policy Name"
                  />
                </div>
              </div>

              <div
                className={twMerge(
                  "mt-2 flex aspect-square w-[240px] items-center justify-center rounded-xl border border-border bg-secondary/20",
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
                  className="h-full rounded-xl object-cover"
                />
              </div>
            </div>

            <Heading className="mt-7">Insurance Description</Heading>
            <textarea
              required
              className={twMerge(twInputStyle, "h-[20vh] resize-none")}
              placeholder="Description"
              name="description"
            />

            <Heading className="mt-7">What is this Insurance for</Heading>
            <select
              onChange={(e) => setCategory(e.target.value)}
              className={twInputStyle}
              name="category"
            >
              {/* @ts-ignore */}
              {insuranceCategories.toSorted().map((cat, key) => (
                <option key={key} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {category == "other" && (
              <>
                <input
                  required
                  className={twMerge("mt-2", twInputStyle)}
                  placeholder="Enter what this insurance is for (Eg: Naval Accidents)"
                  name="category"
                />
              </>
            )}

            <div className="mt-7 flex gap-x-7">
              <div className="w-1/2 basis-1/2">
                <Heading tooltip="This indicates minimum amount the user can claim from this policy">
                  Minimum claim for the policy
                </Heading>
                <input
                  required
                  name="minimumClaim"
                  className={twMerge(twInputStyle, "w-full")}
                  placeholder="Amount"
                  type="number"
                />
              </div>
              <div className="w-1/2 basis-1/2">
                <Heading tooltip="This indicates maximum amount the user can claim from this policy">
                  Maximum claim for the policy
                </Heading>
                <input
                  required
                  name="maximumClaim"
                  className={twMerge(twInputStyle, "w-full")}
                  placeholder="Amount"
                  type="number"
                />
              </div>
            </div>
            <div className="mt-7 flex flex-col gap-x-7 gap-y-7">
              {!manualPremiumCheck && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 rounded-lg bg-primary/20 px-4 py-2 duration-300 ease-in hover:bg-primary/10">
                    <div className="flex animate-pulse items-center gap-x-1 font-bold text-red-500 duration-300 ease-in">
                      <Icon icon="warning" />
                    </div>
                    <p className="text-sm duration-300 ease-in group-hover:opacity-40">
                      You will have access to "claimValue" in USDJ and
                      "claimDuration" in Milliseconds variables in your function
                      by default. You can directly use them in the calculation
                      logic. Do not redeclare them..
                    </p>
                  </div>
                  <div className="flex gap-x-7">
                    <div className="w-1/2 basis-1/2 rounded-lg border-2 border-mute/40">
                      <div className="flex flex-col p-2">
                        <Heading className="">
                          Premium Calculation Function
                        </Heading>
                        <p className="text-sm font-semibold text-zinc-200">
                          {" "}
                          Return Type:{" "}
                          <span className="text-red-600">Float</span>
                        </p>
                      </div>
                      <textarea
                        required
                        className="scrollbar-primary h-[20vh] w-full resize-none border-2 border-mute/40 border-x-transparent bg-background p-1 text-xs outline-none"
                        readOnly
                        value={premiumFunc}
                        name="premiumFunc"
                        onClick={() => {
                          modal.show(
                            <TexteditorModal
                              defaultValue={premiumFunc}
                              setter={setPremiumFunc}
                              argsSetter={setPremiumFuncArgs}
                              extraParams={["claimValue", "claimDuration"]}
                              placeholder={`def premium(param1, param2):
    return (claimValue * 0.01 * (param1 + param2)) * (claimDuration / 86400000)
          `}
                            />,
                          );
                        }}
                      />
                      <ArgsTypeDefine
                        className="p-2"
                        args={premiumFuncArgs}
                        setter={setPremiumFuncArgsSetter}
                        key={premiumFunc}
                      />
                    </div>
                    <div className="flex basis-1/2 flex-col gap-y-2">
                      <Heading tooltip="Provide description such that a non-technical person will be able to understand you function">
                        Describe this function
                      </Heading>
                      <textarea
                        required
                        className={twMerge(
                          twInputStyle,
                          "scrollbar-primary h-[25vh] w-full resize-none text-sm",
                        )}
                        placeholder="Description"
                        name="premiumFuncDescription"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="group flex justify-between rounded-lg bg-primary/20 px-4 py-2 text-sm duration-300 ease-in hover:bg-primary/10">
                <p className="duration-300 ease-in group-hover:opacity-40">
                  I want to manually verify the request and calculate the
                  premium..
                </p>
                <div className="flex items-center gap-2">
                  <div className="hidden animate-pulse items-center gap-x-1 font-bold text-red-500 duration-300 ease-in group-hover:flex">
                    Work in Progress{" "}
                    <span>
                      <Icon icon="warning" />
                    </span>
                  </div>
                  <input
                    disabled
                    className="w-[1.2rem] duration-300 ease-in group-hover:opacity-40"
                    type="checkbox"
                    checked={manualPremiumCheck}
                    onChange={() => setManualPremiumCheck(!manualPremiumCheck)}
                  />
                </div>
              </div>

              {!manualClaimCheck && (
                <div>
                  <div className="flex gap-2 rounded-lg bg-primary/20 px-4 py-2 duration-300 ease-in hover:bg-primary/10">
                    <div className="flex animate-pulse items-center gap-x-1 font-bold text-red-500 duration-300 ease-in">
                      <Icon icon="warning" />
                    </div>
                    <p className="text-sm duration-300 ease-in group-hover:opacity-40">
                      The Claim Validation Function will automatically inherit
                      all the arguments along with their values entered by the
                      buyer when they purchase a policy as global variables. You
                      can directly use them in your function for validating the
                      claim.
                    </p>
                  </div>
                  <div className="mt-4 flex gap-x-7">
                    <div className="w-1/2 basis-1/2 rounded-lg border-2 border-mute/40">
                      <div className="flex flex-col p-2">
                        <Heading className="">
                          Claim Validation Function
                        </Heading>
                        <p className="text-sm font-semibold text-zinc-200">
                          {" "}
                          Return Type:{" "}
                          <span className="text-red-600">Boolean</span>
                        </p>
                      </div>
                      <textarea
                        required
                        className="scrollbar-primary h-[20vh] w-full resize-none border-2 border-mute/40 border-x-transparent bg-background p-1 text-xs outline-none"
                        readOnly
                        value={claimFunc}
                        name="claimFunc"
                        onClick={() => {
                          modal.show(
                            <TexteditorModal
                              defaultValue={claimFunc}
                              setter={setClaimFunc}
                              argsSetter={setClaimFuncArgs}
                              placeholder={`def claim():
    if (claimDuration > 8640000 and param1*param2 > 10):
        return True
    else:
        return False
          `}
                            />,
                          );
                        }}
                      />
                      <ArgsTypeDefine
                        key={claimFunc}
                        className="p-2"
                        args={claimFuncArgs}
                        setter={setclaimFuncArgsSetter}
                      />
                    </div>
                    <div className="flex basis-1/2 flex-col gap-y-2">
                      <Heading tooltip="Provide description such that a non-technical person will be able to understand you function">
                        Describe this function
                      </Heading>
                      <textarea
                        required
                        className={twMerge(
                          twInputStyle,
                          "scrollbar-primary h-[25vh] w-full resize-none text-sm",
                        )}
                        placeholder="Description"
                        name="claimFuncDescription"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="group flex justify-between rounded-lg bg-primary/20 px-4 py-2 text-sm duration-300 ease-in hover:bg-primary/10">
                <p className="duration-300 ease-in group-hover:opacity-40">
                  I want to manually verify the request of the Claim..
                </p>
                <div className="flex gap-2">
                  <div className="hidden animate-pulse items-center gap-x-1 font-bold text-red-500 duration-300 ease-in group-hover:flex">
                    Work in Progress{" "}
                    <span>
                      <Icon icon="warning" />
                    </span>
                  </div>
                  <input
                    disabled
                    className="duration-300 ease-in group-hover:opacity-40"
                    type="checkbox"
                    checked={manualClaimCheck}
                    onChange={() => setManualClaimCheck(!manualClaimCheck)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-7 flex gap-x-7">
              <div className="w-1/2 basis-1/2">
                <Heading tooltip="This indicates for minimum how long a user can take this policy">
                  Minimum duration for the policy
                </Heading>
                <DurationInput
                  className={twMerge("mt-2 w-1/2", twInputStyle)}
                  name="minimumDuration"
                  defaultValue={1000 * 60 * 60 * 24}
                />
              </div>
              <div className="w-1/2 basis-1/2">
                <Heading tooltip="This indicates for maximum how long a user can take this policy">
                  Maximum duration for the policy
                </Heading>
                <DurationInput
                  className={twMerge("mt-2 w-1/2", twInputStyle)}
                  name="maximumDuration"
                  defaultValue={1000 * 60 * 60 * 24}
                />
              </div>
            </div>

            <div className="mt-7 flex flex-col">
              <Heading>Tags</Heading>
              <ToastsInput
                setter={setTags}
                className={twMerge("mb-3 mt-1 text-sm", twInputStyle)}
              />
            </div>

            <div className="mt-2 flex items-start gap-4">
              <button
                type="submit"
                className="rounded-md bg-primary px-6 py-2 font-medium text-front disabled:animate-pulse disabled:cursor-progress disabled:opacity-60"
                disabled={loading}
              >
                Save
              </button>
              <div className="w-full rounded-lg bg-red-300 p-2 text-black">
                <p className="text-xs leading-tight">
                  Once you create this policy, you won't be able to edit its
                  details. Therefore, it is crucial to carefully review all the
                  information you provide. Double-check every field to ensure
                  accuracy and completeness before proceeding. Make sure
                  everything is correct to avoid any future issues or
                  discrepancies.
                </p>
              </div>
            </div>
          </DataForm>
        </section>
      </div>
    </>
  );
}
