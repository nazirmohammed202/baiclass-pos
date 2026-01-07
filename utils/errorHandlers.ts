export const handleError = (error: unknown): string => {
  let errorMessage = "Request failed. Please try again.";
  type ApiError = { response?: { data?: string } };
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    (error as ApiError).response?.data
  ) {
    errorMessage = (error as ApiError).response!.data!;
  }
  return errorMessage;
};
