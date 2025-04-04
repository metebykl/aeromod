import { useQuery } from "@tanstack/react-query";
import { getAddons } from "@/api/addon";

export const useGetAddons = () => {
  return useQuery({ queryKey: ["getAddons"], queryFn: getAddons });
};
