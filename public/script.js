async function fetchUrls() {
    const keyword = document.getElementById('keyword').value;
    try {
        const response = await fetch(`/urls/${keyword}`);
        if (response.ok) {
            const urls = await response.json();
            displayUrls(urls);
        } else {
            alert('Keyword not found');
        }
    } catch (error) {
        console.error('Error fetching URLs:', error);
    }
}

function displayUrls(urls) {
    const urlsDiv = document.getElementById('urls');
    urlsDiv.innerHTML = '';
    urls.forEach(url => {
        const button = document.createElement('button');
        button.innerText = url;
        button.onclick = () => downloadContent(url);
        urlsDiv.appendChild(button);
    });
}

async function downloadContent(url) {
    const statusDiv = document.getElementById('status');
    statusDiv.innerText = 'Downloading...';

    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (response.ok) {
            const reader = response.body.getReader();
            const textDecoder = new TextDecoder();
            let receivedLength = 0;
            let chunks = [];
            const totalLength = parseInt(response.headers.get('content-length'), 10);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                receivedLength += value.length;
                const progress = Math.round((receivedLength / totalLength) * 100);
                statusDiv.innerText = `Downloading: ${progress}%`;

                chunks.push(value);
            }

            const htmlString = chunks.reduce((acc, chunk) => acc + textDecoder.decode(chunk, { stream: true }), '') + textDecoder.decode();
            statusDiv.innerText = 'Download complete';
            saveToLocalStorage(url, htmlString);
            displayDownloadedContent(htmlString);
        } else {
            statusDiv.innerText = 'Download failed';
        }
    } catch (error) {
        statusDiv.innerText = 'Download failed';
        console.error('Error downloading content:', error);
    }
}

function saveToLocalStorage(url, content) {
    localStorage.setItem(url, content);
}

function displayDownloadedContent(content) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.srcdoc = content;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    contentDiv.appendChild(iframe);
}