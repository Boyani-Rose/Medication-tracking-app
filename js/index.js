document.addEventListener('DOMContentLoaded', function () {
    getMedications()
});

let medications = [];

function calculateReminderTimes (frequency) {
    const times = {
        1: ['08:00'],
        2: ['08:00', '20:00'],
        3: ['08:00', '20:00']
    }
    return times [frequency] || []
}

document.querySelector('#form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const medicationName = document.querySelector('#medication-name').value;
    const pillCount = document.querySelector('#pill-count').value;
    const pillsPerDose = document.querySelector('#pill-per-dose').value;
    const frequency = document.querySelector('#autoSizingSelect').value;

    if (!medicationName || !pillCount || !pillsPerDose || !frequency) {
        alert("Please fill all fields before submitting.");
        return;
    }

    const newMedication = {
        name: medicationName,
        totalPills: Number(pillCount),
        pillsPerDose: Number(pillsPerDose),
        frequency: Number(frequency),
        dosesTaken: 0,
        reminderTimes : calculateReminderTimes(frequency)
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
        getMedications()
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

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(displayMedication);
        } else {
            console.warn("No medications found.");
        }
    })
    .catch(error => console.error("Error fetching medications:", error));
}


function displayMedication(medication) {
    if (!medication || !medication.name) {
        console.error("Invalid medication data:", medication);
        return;
    }

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


async function updateMedication(id) {
    try {
        const response = await fetch(`http://localhost:3000/medications/${id}`);
        const medication = await response.json();

        const updatedData = { dosesTaken: medication.dosesTaken + 1 };

        await fetch(`http://localhost:3000/medications/${id}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        getMedications()
    } catch (error) {
        console.error("Error updating medication:", error);
    }
}


document.addEventListener('click', function(event) {
    if (event.target.classList.contains('btn-taken')) {
        const medicationId = event.target.dataset.id;
        if (medicationId) updateMedication(medicationId);
    }
});


async function deleteMedication(id) {
    try {
        await fetch(`http://localhost:3000/medications/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });

        getMedications();
    } catch (error) {
        console.error("Error deleting medication:", error);
    }
}


document.addEventListener('click', function(event) {
    if (event.target.classList.contains('btn-delete')) {
        const medicationId = event.target.dataset.id;
        if (medicationId) deleteMedication(medicationId);
    }
});
