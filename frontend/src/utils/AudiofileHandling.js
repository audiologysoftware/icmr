import backendIP from './serverData';

// Function to get audio file
export async function getAudio(filenameWithPath, callback) {
    try {
        const response = await fetch(`${backendIP}/audio/getaudio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filenameWithPath }),
        });

        if (response.ok) { 
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            callback(audioUrl);
        } else {
            console.error('Failed to fetch audio file:', response.statusText);
            callback(null);
        }
    } catch (error) {
        console.error('Error fetching audio file:', error);
        callback(null);
    }
}

