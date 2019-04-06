export interface LGTVRequestPayload {
    [x: string]: boolean | number | string | object |
    {
        [x: string]: boolean | number | string | object;
    };
}

export interface LGTVRequest {
    uri: string;
    payload?: LGTVRequestPayload;
}