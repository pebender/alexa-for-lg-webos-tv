export interface LGTVRequestPayload {
    [x: string]: undefined | boolean | number | string | object |
    {
        [x: string]: undefined | boolean | number | string | object;
    };
}

export interface LGTVRequest {
    uri: string;
    payload?: LGTVRequestPayload;
}