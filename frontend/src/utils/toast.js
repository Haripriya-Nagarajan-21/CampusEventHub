import { toast } from "react-toastify";

const ops = { position: "top-right", autoClose: 3000, theme:"colored"};


export const notifySuccess = (msg) =>
  toast.success(msg, ops);

export const notifyError = (msg) =>
  toast.error(msg,ops);

export const notifyInfo = (msg) =>
  toast.info(msg, ops);

export const notifyWarn = (msg) =>
  toast.warn(msg, ops);
