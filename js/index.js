document.addEventListener ('DOMContentLoaded', function (event){
   event.preventDefault()
    
getMedications()

})

let medications =[]


document.querySelector('#form').addEventListener ('submit', async function (event){
    event.preventDefault()
    getMedications()
    const medicationName = document.querySelector('#medication-name').value
    const pillCount = document.querySelector('#pill-count').value
    const pillsPerDose = document.querySelector('#pill-per-dose').value
    const frequency = document.querySelector('#autoSizingSelect').value

  

    const newMedication = {
        name: medicationName,
        totalPills: Number(pillCount),
        pillsPerDose: Number(pillsPerDose),
        frequency: Number(frequency),
        dosesTaken: 0
    }
    clearMedications()

    const response = await fetch('http://localhost:3000/medications', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMedication)
    })
    const data = await response.json()
    displayMedication(data)
    getMedications()


       
    })


function getMedications () {
    return fetch('http://localhost:3000/medications',{
        method : 'GET',
        headers : {
            'Accept' : 'application/json'
        }

    }) .then((response)=>response.json())
    .then ((data)=>(data))
  

}


function displayMedication (medication) {

    const listOfMedications = document.querySelector('tbody#medication-list')
    const row = document.createElement('tr');
    row.innerHTML = `
        <th scope="row">${medication.id}</th>
        <td>${medication.name}</td>
        <td>${medication.frequency}</td>
        <td>${medication.timeToTake || "Not set"}</td>
        <td>${medication.dosesTaken || 0}</td>
        <td>${medication.totalPills - (medication.dosesTaken * medication.pillsPerDose)}</td>
        <td><button class="btn-taken" data-id="${medication.id}">Taken</button></td>
        <td><button class="btn-delete" data-id="${medication.id}">Delete</button></td>
        <td>Fatigue</td>
    `;

    listOfMedications.appendChild(row)
}

function clearMedications() {
    const listOfMedications = document.querySelector('tbody#medication-list');
    listOfMedications.innerHTML = ''
}
function updateMedication(id, updatedData) {
    fetch(`http://localhost:3000/medications/${id}`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData) 
    })
    .then(response => response.json())
    .then(updatedMedication => {
        console.log('Updated Medication:', updatedMedication);
        getMedications(); 

    })
}
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('btn-taken')) {
        const medicationId = event.target.dataset.id; 
        updateMedication(medicationId, { dosesTaken: 1 });
    }
});
  
function deleteMedication(id) {
    fetch(`http://localhost:3000/medications/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json'
        }
    })
}
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('btn-delete')) {
        const medicationId = event.target.dataset.id
        deleteMedication(medicationId);
    }
})


