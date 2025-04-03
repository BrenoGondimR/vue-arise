import axios, { AxiosResponse } from 'axios';
import { IObject } from '@/interfaces/IObject';

class ApiService {
    constructor() {}

    /**
     * Send a GET request
     * @throws {Error} If an error occurs during the GET request
     */
    async get(
        url: string,
        headers?: IObject,
        params?: IObject,
        signal?: AbortSignal
    ): Promise<AxiosResponse> {
        return axios
            .get(url, {
                headers: headers,
                params: params,
                ...(signal ? { signal } : {}),
            })
            .then((response: AxiosResponse) => this.handleResponse(response))
            .then((response: AxiosResponse) => response);
    }

    /**
     * Send a GET request to download a Blob
     * @throws {Error} If an error occurs during the GET request
     */
    async getBlob(
        url: string,
        headers?: IObject
    ): Promise<AxiosResponse> {
        return axios
            .get(url, {
                headers: headers,
                responseType: 'blob',
            })
            .then((response: AxiosResponse) => this.handleResponse(response))
            .then((response: AxiosResponse) => response);
    }

    /**
     * Send a POST request
     * @throws {Error} If an error occurs during the POST request
     */
    async post(
        url: string,
        data: unknown,
        headers?: IObject,
        signal?: AbortSignal
    ): Promise<AxiosResponse> {
        return axios
            .post(url, data, {
                headers: headers ?? {},
                ...(signal ? { signal } : {}),
            })
            .then((response: AxiosResponse) => this.handleResponse(response))
            .then((response: AxiosResponse) => response);
    }

    /**
     * Send a PUT request
     * @throws {Error} If an error occurs during the PUT request
     */
    async put(
        url: string,
        data: unknown,
        headers?: IObject,
        signal?: AbortSignal
    ): Promise<AxiosResponse> {
        return axios
            .put(url, JSON.stringify(data), {
                headers: headers ?? {},
                ...(signal ? { signal } : {}),
            })
            .then((response: AxiosResponse) => this.handleResponse(response))
            .then((response: AxiosResponse) => response);
    }

    /**
     * Send a DELETE request
     * @throws {Error} If an error occurs during the DELETE request
     */
    async delete(
        url: string,
        headers?: IObject
    ): Promise<AxiosResponse | undefined> {
        return axios
            .delete(url, {
                headers: headers ?? {},
            })
            .then((response: AxiosResponse) => this.handleResponse(response));
    }

    /**
     * Handle and check the HTTP response status and data.
     * @throws {Error} If the response indicates an unsuccessful status code or if no data is returned
     */
    private async handleResponse(response: AxiosResponse): Promise<AxiosResponse> {
        if (response.status >= 200 && response.status < 300) {
            if (typeof response.data !== 'undefined') {
                return response;
            }
            throw new Error(
                `Request succeeded but no data was returned. Status: ${response.status} - ${response.statusText}`
            );
        }

        // If the status is not 2xx or we have any other issues, throw a descriptive error
        throw new Error(
            `Request failed with status ${response.status} - ${response.statusText}`
        );
    }
}

export default new ApiService();
