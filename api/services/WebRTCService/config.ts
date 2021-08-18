export const config = {
    iceServers: [
        {
            urls: 'turn:18.185.72.86:3478?transport=tcp',
            credential: '2021',
            username: 'digitalstage',
        },
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302',
            ],
        },
    ],
}
