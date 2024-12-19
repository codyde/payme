import { User } from "lucia";
import { create } from "zustand";
import { validateRequest } from "./lucia";

interface UserState {
  userData: User | null;
  fetchUser: () => Promise<void>;
}

const useUserDataStore = create<UserState>((set) => ({
  userData: null,
  isLoading: false,
  error: null,
  fetchUser: async () => {
    const { user } = await validateRequest();
    set(() => ({ userData: user }));
  },
}));

export default useUserDataStore;