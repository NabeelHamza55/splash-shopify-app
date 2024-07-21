import axios, { AxiosResponse } from "axios";

export async function postRequest<TRequest, TResponse>(
  url: string,
  data: TRequest
): Promise<TResponse> {
  try {
    const response: AxiosResponse<TResponse> = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error making POST request:", error);
    throw error;
  }
}
