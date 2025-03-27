document.addEventListener('DOMContentLoaded', function () {
    Notification.requestPermission()
        .then(permission => {
            if (permission === "granted") {
                console.log("Notifications permitted");
            } else {
                console.log("Notifications blocked by user");
            }
        })
        .catch(error => {
            console.error("Error requesting notification permission:", error);
        });

    getMedications();
    checkReminders();
    resetAtMidnight();
});

let medications = [];

function calculateReminderTimes(frequency) {
    const times = {
        1: ['08:00'],
        2: ['08:00', '14:00'],
        3: ['08:00', '14:00', '20:00']
    };
    return times[frequency] || [];
}

document.querySelector('#form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const medicationName = document.querySelector('#medication-name');
    const pillCount = document.querySelector('#pill-count');
    const pillsPerDose = document.querySelector('#pill-per-dose');
    const frequency = document.querySelector('#autoSizingSelect');

    if (!medicationName.value || !pillCount.value || !pillsPerDose.value || !frequency.value) {
        alert("Please fill all fields before submitting.");
        return;
    }

    const newMedication = {
        name: medicationName.value,
        totalPills: Number(pillCount.value),
        pillsPerDose: Number(pillsPerDose.value),
        frequency: Number(frequency.value),
        dosesTaken: 0,
        reminderTimes: calculateReminderTimes(frequency.value)
    };

    try {
        const response = await fetch('http://localhost:3000/medications', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newMedication)
        });

        await response.json();
        getMedications();

        
        medicationName.value = "";
        pillCount.value = "";
        pillsPerDose.value = "";
        frequency.value = "";
        
    } catch (error) {
        console.error("Error adding medication:", error);
    }
});


function getMedications() {
    fetch('http://localhost:3000/medications', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Fetched medications:", data);
        clearMedications();
        data.forEach(displayMedication);
    })
    .catch(error => console.error("Error fetching medications:", error));
}

function displayMedication(medication) {
    const listOfMedications = document.querySelector('tbody#medication-list');
    const row = document.createElement('tr');
    const dosesTaken = medication.dosesTaken || 0;
    const totalPills = medication.totalPills || 0;
    const pillsPerDose = medication.pillsPerDose || 1;
    const pillsLeft = totalPills - (dosesTaken * pillsPerDose);

    row.innerHTML = `
        <th scope="row">${medication.id || "N/A"}</th>
        <td>${medication.name || "Unknown"}</td>
        <td>${medication.frequency || "Not set"}</td>
        <td>${medication.reminderTimes ? medication.reminderTimes.join(", ") : "Not set"}</td>
        <td>${dosesTaken}</td>
        <td>${isNaN(pillsLeft) ? "N/A" : pillsLeft}</td>
        <td><button class="btn-taken" data-id="${medication.id}">Taken</button></td>
        <td><button class="btn-delete" data-id="${medication.id}">Delete</button></td>
    `;
    listOfMedications.appendChild(row);
}

function clearMedications() {
    document.querySelector('tbody#medication-list').innerHTML = '';
}

document.addEventListener("click", async function (event) {
    if (event.target.classList.contains("btn-taken")) {
        const medicationId = event.target.dataset.id;
        try {
            const response = await fetch(`http://localhost:3000/medications/${medicationId}`);
            const medication = await response.json();

            const updatedDoses = (medication.dosesTaken || 0) + 1;
            const updatedReminderTimes = updateReminderTimes(medication.reminderTimes);

            await fetch(`http://localhost:3000/medications/${medicationId}`, {
                method: "PATCH",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    dosesTaken: updatedDoses,
                    reminderTimes: updatedReminderTimes
                })
            });

            getMedications();

            
        } catch (error) {
            console.error("Error updating medication:", error);
        }
    }
    if (event.target.classList.contains("btn-delete")) {
        const medicationId = event.target.dataset.id;
        if (confirm("Are you sure you want to delete this medication?")) {
            try {
                await fetch(`http://localhost:3000/medications/${medicationId}`, {
                    method: "DELETE",
                    headers: { "Accept": "application/json" }
                });
                getMedications();
            } catch (error) {
                console.error("Error deleting medication:", error);
            }
        }
    }
});

function updateReminderTimes(reminderTimes) {
    if (!reminderTimes || reminderTimes.length === 0) {
        return [];
    }
    for (let i = 0; i < reminderTimes.length; i++) {
        if (!reminderTimes[i].includes("<s>")) {
            reminderTimes[i] = `<s>${reminderTimes[i]}</s>`;
            break;
        }
    }
    return reminderTimes;
}

async function checkReminders() {
    console.log("Reminder system started...");
    
    setInterval(async function () {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

        console.log("Checking for reminders at:", currentTime);

        try {
            const response = await fetch('http://localhost:3000/medications');
            const medications = await response.json();

            medications.forEach(medication => {
                if (medication.reminderTimes) {
                    medication.reminderTimes.forEach(time => {
                        if (time === currentTime) {
                            const notificationKey = `notified-${medication.id}-${currentTime}`;
                            
                            if (!localStorage.getItem(notificationKey)) {
                                console.log(`Triggering alert for: ${medication.name} at ${currentTime}`);
                                showNotification(`Time to take: ${medication.name}`);
                                localStorage.setItem(notificationKey, "true");
                            }
                        }
                    });
                }
            });
        } catch (error) {
            console.error("Error fetching medications for reminders:", error);
        }
    }, 60000);
}


function showNotification(message) {
    if (Notification.permission === "granted") {
        try {
            new Notification('Medication Reminder', {
                body: message,
                icon: 'take-med-gif.gif'
            });
            playNotificationSound();
        } catch (error) {
            console.error("Error showing notification:", error);
        }
    } else {
        console.warn("Notifications blocked. Playing sound instead.");
        playNotificationSound();
        alert(message); 
    }
}


function resetAtMidnight() {
    setInterval(async function () {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            try {
                const response = await fetch('http://localhost:3000/medications');
                const medications = await response.json();

                medications.forEach(async medication => {
                    await fetch(`http://localhost:3000/medications/${medication.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ dosesTaken: 0 })
                    });
                });

                localStorage.clear();
                getMedications();
            } catch (error) {
                console.error("Error resetting medications:", error);
            }
        }
    }, 60000);
}




