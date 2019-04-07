export interface LGTVRequestPayload {
    [x: string]: boolean | number | string |
    {
        [x: string]: boolean | number | string;
    };
}

export interface LGTVRequest {
    uri: string;
    payload?: LGTVRequestPayload;
}