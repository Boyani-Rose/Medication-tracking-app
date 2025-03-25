document.addEventListener ('DOMContentLoaded', function (){
    
getMedications()



})

let medications =[]


document.querySelector('#form').addEventListener ('submit', function (event){
    event.preventDefault()
    const medicationName = document.querySelector('#medication-name').value
    const pillCount = document.querySelector('#pill-count').value
    const pillsPerDose = document.querySelector('#pill-per-dose').value
    const frequency = document.querySelector('#autoSizingSelect').value

  

    const newMedication = {
        id: medication.id,
        name: medicationName,
        totalPills: Number(pillCount),
        pillsPerDose: Number(pillsPerDose),
        frequency: Number(frequency),
        dosesTaken: 0
    }

    fetch ('http://localhost:3000/medications', {
        method : 'POST',
        headers :{
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify (newMedication)
            
    }).then((response) => response.json())
    .then((data)=> {
        medications.push(data)
        displayMedication(data)
        event.target.reset()
    })





    // if (event.target.classList.contains('form-control')){
    //     const addedMedication = medications.find((med)=> med.id === event.target.id)
    //     addMedicationToList(addedMedication)
    // }
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
        <td>Fatigue</td>
    `;

    listOfMedications.appendChild(row)
}
