import { createContext } from "react";

export type UserDetail = {
  uid: string;
  email: string | null;
  role: string | null;
  approved: boolean | null;
  hamlet: string | null;
};

export const UserDetailContext = createContext<{
  userDetail: UserDetail | null;
  setUserDetail: React.Dispatch<React.SetStateAction<UserDetail | null>>;
}>({
  userDetail: null,
  setUserDetail: () => {},
});
