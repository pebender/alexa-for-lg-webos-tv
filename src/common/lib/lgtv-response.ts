export interface LGTVResponse {
    "returnValue": boolean;
    [x: string]: boolean | number | string | object;
}

export interface LGTVResponseVolume extends LGTVResponse {
    "scenario": string;
    "volume": number;
    "muted": boolean;
    "volumeMax": number;
}

export interface LGTVResponseForgroundAppInfo extends LGTVResponse {
    "appId": string;
    "windowId": string;
    "processId": string;
}

export interface LGTVResponseExternalInputListDevice extends LGTVResponse
{
    "id": string;
    "label": string;
    "port": number;
    "appId": string;
    "icon": string;
    "modified": boolean;
    "subList": {
        [x: string]: boolean | number | string;
    }[];
    "subCount": number;
    "connected": boolean;
    "favorite": boolean;
}

export interface LGTVResponseExternalInputList extends LGTVResponse
{
    "devices": LGTVResponseExternalInputListDevice[];
}