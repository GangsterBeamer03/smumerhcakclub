const initialForm = document.getElementById('initialForm');
const fileForm = document.getElementById('fileForm');
const nextBtn = document.getElementById('nextBtn');
const addFileBtn = document.getElementById('addFileBtn');
const fileInputsContainer = document.getElementById('fileInputsContainer');
const logContent = document.getElementById('logContent');

let apiKey, projectName, totalDuration, startDate, endDate, machine;
let fileIndex = 0;
let isMinutesMode = true; // Track which mode is active

const logMessage = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry'; 
    logEntry.textContent = `[${timestamp}] ${message}`;
    logContent.appendChild(logEntry);
    logContent.parentElement.scrollTop = logContent.parentElement.scrollHeight;

    setTimeout(() => logEntry.classList.add('visible'), 50); 
};

const smoothHide = (element) => {
    element.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
    element.style.opacity = 0;
    element.style.transform = "translateY(-30px)";
    setTimeout(() => (element.style.display = 'none'), 500); 
};

const smoothShow = (element) => {
    element.style.display = 'block';
    element.style.opacity = 0;
    element.style.transform = "translateY(30px)";
    
    setTimeout(() => {
        element.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
        element.style.opacity = 1;
        element.style.transform = "translateY(0)";
    }, 50); 
};

const transitionForm = (fromForm, toForm) => {
    smoothHide(fromForm);
    smoothShow(toForm);
};

// Initialize to start with the 'minutes' option selected
window.addEventListener('load', () => {
    minutesBtn.classList.add('active'); // Set minutes button as active
    dateBtn.classList.remove('active'); // Remove active class from date button
    document.getElementById('timeForm').style.display = 'none'; // Hide time form
    document.getElementById('endDateForm').style.display = 'none'; // Hide end date form
});

// Add event listeners for the buttons to toggle forms
dateBtn.addEventListener('click', () => {
    isMinutesMode = false;
    dateBtn.classList.add('active');
    minutesBtn.classList.remove('active');
    document.getElementById('timeForm').style.display = 'block'; // Show time form
    document.getElementById('endDateForm').style.display = 'block'; // Show end date form
    document.getElementById('totalDuration').parentElement.style.display = 'none'; // Hide duration input
});

minutesBtn.addEventListener('click', () => {
    isMinutesMode = true;
    minutesBtn.classList.add('active');
    dateBtn.classList.remove('active');
    document.getElementById('timeForm').style.display = 'none'; // Hide time form
    document.getElementById('endDateForm').style.display = 'none'; // Hide end date form
    document.getElementById('totalDuration').parentElement.style.display = 'block'; // Show duration input
});

nextBtn.addEventListener('click', () => {
    apiKey = document.getElementById('apiKey').value;
    projectName = document.getElementById('projectName').value;
    machine = document.getElementById('machine').value;

    if (!apiKey || !projectName || !machine) {
        logMessage("Error: Please fill in all fields before proceeding.");
        return;
    }

    if (isMinutesMode) {
        totalDuration = parseInt(document.getElementById('totalDuration').value);
        if (isNaN(totalDuration)) {
            logMessage("Error: Please enter a valid duration in minutes.");
            return;
        }
        logMessage("Initial inputs collected. Moving to file input step...");
        transitionForm(initialForm, fileForm);
        addFileInput();
    } else {
        startDate = document.getElementById('startDate').value;
        endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            logMessage("Error: Please fill in all date fields before proceeding.");
            return }

        const startTime = new Date(startDate).getTime();
        const endTime = new Date(endDate).getTime();

        if (startTime >= endTime) {
            logMessage("Error: End date/time must be after start date/time.");
            return;
        }

        logMessage("Initial inputs collected. Moving to file input step...");
        transitionForm(initialForm, fileForm);
        addFileInput();
    }
});

const addFileInput = () => {
    fileIndex++;
    logMessage(`Preparing input fields for File #${fileIndex}...`);

    const fileInputGroup = document.createElement('div');
    fileInputGroup.className = 'form-group';

    const fileLabel = document.createElement('label');
    fileLabel.textContent = `File #${fileIndex} Name:`;
    fileInputGroup.appendChild(fileLabel);

    const fileInput = document.createElement('input');
    fileInput.type = 'text';
    fileInput.id = `fileName${fileIndex}`;
    fileInput.required = true;
    fileInput.placeholder = `Enter name of file #${fileIndex}`;
    fileInputGroup.appendChild(fileInput);

    const linesLabel = document.createElement('label');
    linesLabel.textContent = `Number of Lines for File #${fileIndex}:`;
    fileInputGroup.appendChild(linesLabel);

    const linesInput = document.createElement('input');
    linesInput.type = 'number';
    linesInput.id = `lines${fileIndex}`;
    linesInput.required = true;
    linesInput.placeholder = `Enter lines of file #${fileIndex}`;
    fileInputGroup.appendChild(linesInput);

    fileInputsContainer.appendChild(fileInputGroup);
    logMessage(`File #${fileIndex} input fields added.`);
};

addFileBtn.addEventListener('click', () => {
    logMessage("Adding another file input...");
    addFileInput();
});

const chunkArray = (array, minSize, maxSize) => {
    const chunks = [];
    while (array.length) {
        const chunkSize = Math.min(
            maxSize,
            Math.max(minSize, Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize)
        );
        chunks.push(array.splice(0, chunkSize));
    }
    return chunks;
};

const gaussianRandom = (mean, stdDev) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
};

const simulateActivityPattern = (startTime, endTime) => {
    const activityIntervals = [];
    let time = startTime;

    while (time < endTime) {
        const active = Math.random() > 0.3;
        const mean = active ? 105 : 240;
        const stdDev = active ? 10 : 30;
        let interval = Math.max(1, Math.round(gaussianRandom(mean, stdDev)));
        if (active) {
            interval = Math.min(interval, 120);
        } else {
            interval = Math.min(interval, 300);
        }
        activityIntervals.push({ active, interval });
        time += interval;
    }
    return activityIntervals;
};

fileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const files = [];
    for (let i = 1; i <= fileIndex; i++) {
        const fileName = document.getElementById(`fileName${i}`).value;
        const lines = parseInt(document.getElementById(`lines${i}`).value);
        if (!fileName || isNaN(lines)) {
            logMessage(`Error: Please fill out all details for File #${i}.`);
            return;
        }
        files.push({ fileName, lines });
    }

    logMessage("Preparing and sending heartbeats...");
    let totalHeartbeats = 0;
    const heartbeats = [];

    let currentTimestamp;
    if (isMinutesMode) {
        currentTimestamp = Math.floor(Date.now() / 1000);
        const startTime = currentTimestamp - totalDuration * 60;

        const activityPattern = simulateActivityPattern(startTime, currentTimestamp);
        let timePointer = startTime;

        for (const { active, interval } of activityPattern) {
            if (active) {
                for (const file of files) {
                    const randomLineNo = Math.floor(Math.random() * file.lines) + 1;
                    const randomCursorPos = Math.floor(Math.random() * 100);
                    const randomOffset = Math.floor(Math.random() * 61) - 30;

                    heartbeats.push({
                        branch: "master",
                        category: "coding",
                        cursorpos: randomCursorPos,
                        entity: file.fileName,
                        type: "file",
                        lineno: randomLineNo,
                        lines: file.lines,
                        project: projectName,
                        time: timePointer + randomOffset,
                        user_agent: `wakatime/v1.102.1 (${machine})`,
                    });

                    totalHeartbeats++;
                    logMessage(
                        `Heartbeat for "${file.fileName}" at ${new Date(
                            (timePointer + randomOffset) * 1000
                        ).toLocaleTimeString()} (Line: ${randomLineNo}, Cursor: ${randomCursorPos}, Lines: ${file.lines})`
                    );
                }
            }
            timePointer += interval;
        }
    } else {
        const startTime = new Date(startDate).getTime() / 1000; 
        const endTime = new Date(endDate).getTime() / 1000; 

        const activityPattern = simulateActivityPattern(startTime, endTime);
        let timePointer = startTime;

        for (const { active, interval } of activityPattern) {
            if (active) {
                for (const file of files) {
                    const randomLineNo = Math.floor(Math.random() * file.lines) + 1;
                    const randomCursorPos = Math.floor(Math.random() * 100);
                    const randomOffset = Math.floor(Math.random() * 61) - 30;

                    heartbeats.push({
                        branch: "master",
                        category: "coding",
                        cursorpos: randomCursorPos,
                        entity: file.fileName,
                        type: "file",
                        lineno: randomLineNo,
                        lines: file.lines,
                        project: projectName,
                        time: timePointer + randomOffset,
                        user_agent: `wakatime/v1.102.1 (${machine})`,
                    });

                    totalHeartbeats++;
                    logMessage(
                        `Heartbeat for "${file.fileName}" at ${new Date(
                            (timePointer + randomOffset) * 1000
                        ).toLocaleTimeString()} (Line: ${randomLineNo}, Cursor: ${randomCursorPos}, Lines: ${file.lines})`
                    );
                }
            }
            timePointer += interval;
        }
    }

    const heartbeatChunks = chunkArray([...heartbeats], 10, 15);

    for (const chunk of heartbeatChunks) {
        try {
            const response = await fetch("https://hackatime.hackclub.com/api/hackatime/v1/users/current/heartbeats", {

                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(chunk),
            });

            if (response.ok) {
                logMessage(`Sent ${chunk.length} heartbeats successfully!`);
            } else {
                logMessage("Error: Failed to send a heartbeat chunk.");
            }
        } catch (error) {
            logMessage("Error: Network or server issue while sending heartbeat chunk.");
        }
    }

    logMessage(`Total Heartbeats Sent: ${totalHeartbeats}`);
    logMessage("Heartbeats sent successfully! Process complete.");
});
