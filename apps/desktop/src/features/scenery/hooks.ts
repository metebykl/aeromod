import { useQuery } from "@tanstack/react-query";
import { getSceneryCache } from "./api";

export const sceneryCacheKeys = {
  all: ["sceneryCache"],
};

export const useGetSceneryCache = () => {
  return useQuery({
    queryKey: sceneryCacheKeys.all,
    queryFn: () => getSceneryCache(),
  });
};
