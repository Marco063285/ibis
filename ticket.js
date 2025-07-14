// Mots de passe pour chaque département
let departementPasswords = {
    "Réception": "rec123",
    "Cuisine": "cui123",
    "Entretien": "ent123",
    "Sécurité": "sec123",
    "IT": "it123"
};

// Charger les données sauvegardées si elles existent
const storedDepts = localStorage.getItem("departementPasswords");
if (storedDepts) {
    departementPasswords = JSON.parse(storedDepts);
}

function rafraichirListeDepartementsConnexion() {
    const select = document.getElementById("loginDepartement");
    select.innerHTML = '<option value="" disabled selected>Choisir un département</option>';
    Object.keys(departementPasswords).forEach(dept => {
        const option = document.createElement("option");
        option.value = dept;
        option.textContent = dept;
        select.appendChild(option);
    });
}

// Récupérer éléments
const loginSection = document.getElementById("loginSection");
const mainSection = document.getElementById("mainSection");
const loginForm = document.getElementById("loginForm");
const loginDepartement = document.getElementById("loginDepartement");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");

const deptNameSpan = document.getElementById("deptName");
const logoutBtn = document.getElementById("logoutBtn");
const logoutHeaderBtn = document.getElementById("logoutHeaderBtn");

const ticketFormSection = document.getElementById("ticketFormSection");
const ticketForm = document.getElementById("ticketForm");
const ticketsTableBody = document.getElementById("ticketsTableBody");
const itActionsHeader = document.getElementById("itActionsHeader");
// ... autres éléments existants ...

// AJOUTER CETTE LIGNE (juste après vos autres sélections d'éléments)
const dashboardIT = document.getElementById("dashboardIT");
// Nouveaux éléments pour l'archivage et l'export
const archiveResolvedBtn = document.getElementById("archiveResolvedBtn");
const archivedTicketsSection = document.getElementById("archivedTicketsSection");
const archivedTicketsTableBody = document.getElementById("archivedTicketsTableBody");
const exportButtons = document.getElementById("exportButtons");
const currentDeptSpan = document.getElementById("currentDept");

// Variable pour stocker le département connecté
let currentDepartement = null;
rafraichirListeDepartementsConnexion();

// Charger tickets depuis localStorage ou tableau vide
let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

// Fonction pour afficher les tickets selon département
function afficherTickets() {
    ticketsTableBody.innerHTML = "";

    tickets.forEach((ticket, index) => {
                if (currentDepartement !== "IT" && ticket.departement !== currentDepartement) return;

                const tr = document.createElement("tr");
                tr.innerHTML = `
            <td>${ticket.departement}</td>
            <td>${ticket.nom}</td>
            <td>${ticket.description}</td>
            <td>${ticket.priorite}</td>
            <td>${ticket.date}</td>
            <td class="status-cell ${ticket.status === 'Résolu' ? 'resolved' : ticket.status === 'En cours' ? 'in-progress' : 'pending'}">
                ${ticket.status || "En attente"}
            </td>
            ${currentDepartement === "IT" ? `
                <td>
                    <select onchange="changerStatus(${index}, this.value)" class="status-select">
                        <option value="En attente" ${ticket.status === "En attente" ? "selected" : ""}>En attente</option>
                        <option value="En cours" ${ticket.status === "En cours" ? "selected" : ""}>En cours</option>
                        <option value="Résolu" ${ticket.status === "Résolu" ? "selected" : ""}>Résolu</option>
                    </select>
                    <button onclick="supprimerTicket(${index})" class="delete-btn">Supprimer</button>
                </td>` : `<td></td>`
            }
        `;
        ticketsTableBody.appendChild(tr);
    });

    itActionsHeader.style.display = currentDepartement === "IT" ? "table-cell" : "none";
}

// Fonction pour afficher les tickets archivés
function afficherTicketsArchives() {
    const archivedTickets = JSON.parse(localStorage.getItem("archivedTickets")) || [];
    archivedTicketsTableBody.innerHTML = "";

    archivedTickets.forEach((ticket, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${ticket.departement}</td>
            <td>${ticket.nom}</td>
            <td>${ticket.description}</td>
            <td>${ticket.priorite}</td>
            <td>${ticket.date}</td>
            <td class="status-cell resolved">${ticket.status}</td>
            <td class="action-buttons">
                <button onclick="restaurerTicket(${index})" class="restore-btn">Restaurer</button>
                <button onclick="supprimerTicketArchive(${index})" class="delete-btn">Supprimer</button>
            </td>
        `;
        archivedTicketsTableBody.appendChild(tr);
    });
}

// Fonction pour archiver les tickets résolus
function archiverTicketsResolus() {
    if (currentDepartement !== "IT") return;
    
    const resolvedTickets = tickets.filter(ticket => ticket.status === "Résolu");
    const otherTickets = tickets.filter(ticket => ticket.status !== "Résolu");
    
    const existingArchived = JSON.parse(localStorage.getItem("archivedTickets")) || [];
    const updatedArchived = [...existingArchived, ...resolvedTickets];
    
    localStorage.setItem("archivedTickets", JSON.stringify(updatedArchived));
    localStorage.setItem("tickets", JSON.stringify(otherTickets));
    
    tickets = otherTickets;
    afficherTickets();
    afficherTicketsArchives();
    alert(`${resolvedTickets.length} ticket(s) archivé(s) !`);
}

// Fonction pour restaurer un ticket archivé
function restaurerTicket(index) {
    if (currentDepartement !== "IT") return;
    
    const archivedTickets = JSON.parse(localStorage.getItem("archivedTickets")) || [];
    const ticketToRestore = archivedTickets[index];
    
    tickets.push(ticketToRestore);
    archivedTickets.splice(index, 1);
    
    localStorage.setItem("tickets", JSON.stringify(tickets));
    localStorage.setItem("archivedTickets", JSON.stringify(archivedTickets));
    
    afficherTickets();
    afficherTicketsArchives();
}

// Fonction pour supprimer définitivement un ticket archivé
function supprimerTicketArchive(index) {
    if (currentDepartement !== "IT") return;
    
    if(confirm("Supprimer définitivement ce ticket archivé ?")) {
        const archivedTickets = JSON.parse(localStorage.getItem("archivedTickets")) || [];
        archivedTickets.splice(index, 1);
        localStorage.setItem("archivedTickets", JSON.stringify(archivedTickets));
        afficherTicketsArchives();
    }
}

// Changer status (IT uniquement)
function changerStatus(index, status) {
    tickets[index].status = status;
    localStorage.setItem("tickets", JSON.stringify(tickets));
    afficherTickets();
}

// Supprimer ticket (IT uniquement)
function supprimerTicket(index) {
    if(confirm("Supprimer ce ticket ?")) {
        tickets.splice(index,1);
        localStorage.setItem("tickets", JSON.stringify(tickets));
        afficherTickets();
    }
}

// Gestion connexion
loginForm.addEventListener("submit", function(e){
    e.preventDefault();
    const dept = loginDepartement.value;
    const pass = loginPassword.value;

    if(departementPasswords[dept] && departementPasswords[dept] === pass){
        currentDepartement = dept;
        loginSection.style.display = "none";
        mainSection.style.display = "block";
        deptNameSpan.textContent = currentDepartement;
        
        // Mise à jour de la barre supérieure
        currentDeptSpan.textContent = `Département: ${currentDepartement}`;
        logoutHeaderBtn.style.display = "block";

        // Seul IT n'a pas accès au formulaire d'envoi
        ticketFormSection.style.display = (currentDepartement === "IT") ? "none" : "block";
        adminITSection.style.display = (currentDepartement === "IT") ? "block" : "none";
        
        // Gestion de l'affichage des éléments d'archivage et d'export
        archiveResolvedBtn.style.display = (currentDepartement === "IT") ? "block" : "none";
        archivedTicketsSection.style.display = (currentDepartement === "IT") ? "block" : "none";
        exportButtons.style.display = (currentDepartement === "IT") ? "flex" : "none";
        dashboardIT.style.display = (currentDepartement === "IT") ? "block" : "none";
       
        if (currentDepartement === "IT") {
            afficherDepartementsIT();
            afficherTicketsArchives();
            afficherStatistiquesTickets();
            document.getElementById("dashboardIT").style.display = "block";
        }
        
        afficherTickets();
        loginError.style.display = "none";
        loginForm.reset();
    } else {
                if (dashboardIT) dashboardIT.style.display = "none";  
        loginError.style.display = "block";
    }
});

// Déconnexion
function logout() {
    currentDepartement = null;
    loginSection.style.display = "block";
    mainSection.style.display = "none";
    ticketsTableBody.innerHTML = "";
    currentDeptSpan.textContent = "";
    logoutHeaderBtn.style.display = "none";
}

logoutBtn.addEventListener("click", logout);
logoutHeaderBtn.addEventListener("click", logout);

// Soumission ticket (tous sauf IT)
ticketForm.addEventListener("submit", function(e){
    e.preventDefault();
    const nom = document.getElementById("ticketNom").value.trim();
    const description = document.getElementById("ticketDescription").value.trim();
    const priorite = document.getElementById("ticketPriorite").value;

    if(!nom || !description) {
        alert("Merci de remplir tous les champs");
        return;
    }

    const nouveauTicket = {
        departement: currentDepartement,
        nom,
        description,
        priorite,
        date: new Date().toLocaleString(),
        status: "En attente"
    };

    tickets.push(nouveauTicket);
    if (departementPasswords["IT"]) {
        notifierNouveauTicket(currentDepartement);
    }

    localStorage.setItem("tickets", JSON.stringify(tickets));
    afficherTickets();
    ticketForm.reset();
    alert("Ticket envoyé !");
});

const adminITSection = document.getElementById("adminITSection");
const manageDeptForm = document.getElementById("manageDeptForm");
const departementList = document.getElementById("departementList");
const newDeptName = document.getElementById("newDeptName");
const newDeptPass = document.getElementById("newDeptPass");

function afficherDepartementsIT() {
    departementList.innerHTML = "";
    const deptKeys = Object.keys(departementPasswords);
    
    // === DEBUT DU CODE AJOUTE ===
    // Mettre à jour le compteur
    const countElement = document.getElementById("deptCount");
    if (countElement) {
        countElement.textContent = deptKeys.length;
    }
    // === FIN DU CODE AJOUTE ===

    deptKeys.forEach(dept => {
        const li = document.createElement("li");
        li.innerHTML = `
            <input type="text" value="${dept}" id="name_${dept}" placeholder="Nom département" />
            <input type="text" value="${departementPasswords[dept]}" id="pass_${dept}" placeholder="Mot de passe" />
            <div class="dept-actions">
                <button onclick="mettreAJourDept('${dept}')" class="update-btn">Mettre à jour</button>
                <button onclick="supprimerDepartementIT('${dept}')" class="delete-btn">Supprimer</button>
            </div>
        `;
        departementList.appendChild(li);
    });
}

function supprimerDepartementIT(dept) {
    if (dept === "IT") {
        alert("Impossible de supprimer le département IT.");
        return;
    }
    if (confirm("Supprimer le département " + dept + " ?")) {
        delete departementPasswords[dept];
        localStorage.setItem("departementPasswords", JSON.stringify(departementPasswords));
        afficherDepartementsIT();
        rafraichirListeDepartementsConnexion();
    }
}

manageDeptForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const nom = newDeptName.value.trim();
    const pass = newDeptPass.value.trim();
    if (!nom || !pass) return;
    departementPasswords[nom] = pass;
    localStorage.setItem("departementPasswords", JSON.stringify(departementPasswords));

    rafraichirListeDepartementsConnexion();
    newDeptName.value = "";
    newDeptPass.value = "";
    afficherDepartementsIT();
});

function mettreAJourDept(oldDept) {
    const newName = document.getElementById("name_" + oldDept).value.trim();
    const newPass = document.getElementById("pass_" + oldDept).value.trim();

    if (!newName || !newPass) {
        alert("Nom ou mot de passe invalide.");
        return;
    }

    // Si le nom a changé, on supprime l'ancien et on crée le nouveau
    if (newName !== oldDept) {
        if (departementPasswords[newName]) {
            alert("Ce nom de département existe déjà.");
            return;
        }
        delete departementPasswords[oldDept];
    }

    departementPasswords[newName] = newPass;
    localStorage.setItem("departementPasswords", JSON.stringify(departementPasswords));

    alert("Département mis à jour !");
    afficherDepartementsIT();
    rafraichirListeDepartementsConnexion();
}

function exportTicketsCSV() {
    if (currentDepartement !== "IT") {
        alert("Seul le département IT peut exporter les tickets");
        return;
    }
    
    let lignes = ["Département,Nom,Description,Priorité,Date,Status"];
    tickets.forEach(ticket => {
        lignes.push(`"${ticket.departement}","${ticket.nom}","${ticket.description.replace(/"/g, "'")}","${ticket.priorite}","${ticket.date}","${ticket.status}"`);
    });

    const csvContent = lignes.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tickets_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
}

async function exportTicketsPDF() {
    if (currentDepartement !== "IT") {
        alert("Seul le département IT peut exporter les tickets");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Calculer la largeur de la page et le centre
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    
    // En-tête centré
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("HOTEL IBIS", centerX, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("Rapport des Tickets", centerX, 30, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date du rapport: ${new Date().toLocaleDateString()}`, centerX, 40, { align: "center" });
    doc.text(`Département: ${currentDepartement}`, centerX, 47, { align: "center" });
    
    // Tableau principal avec marges symétriques
    const headers = [["Département", "Nom", "Description", "Priorité", "Date", "Statut"]];
    const data = tickets.map(ticket => [
        ticket.departement,
        ticket.nom,
        ticket.description.substring(0, 80) + (ticket.description.length > 80 ? "..." : ""),
        ticket.priorite,
        ticket.date,
        ticket.status
    ]);
    
    doc.autoTable({
        head: headers,
        body: data,
        startY: 55,
        margin: { left: 15, right: 15 }, // Marges symétriques pour centrage
        theme: "grid",
        styles: {
            fontSize: 10,
            cellPadding: 3,
            valign: "middle",
            overflow: "linebreak",
            halign: "center" // Centrage du texte dans les cellules
        },
        headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: "bold",
            halign: "center"
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        columnStyles: {
            0: { cellWidth: 25, halign: "center" },
            1: { cellWidth: 25, halign: "center" },
            2: { cellWidth: 50, halign: "left" },
            3: { cellWidth: 20, halign: "center" },
            4: { cellWidth: 35, halign: "center" },
            5: { cellWidth: 25, halign: "center" }
        }
    });
    
    // Statistiques résumées
    const stats = {};
    tickets.forEach(ticket => {
        const dept = ticket.departement;
        const status = ticket.status;
        
        if (!stats[dept]) stats[dept] = { "En attente": 0, "En cours": 0, "Résolu": 0, total: 0 };
        if (stats[dept][status] !== undefined) stats[dept][status]++;
        stats[dept].total++;
    });
    
    const lastPage = doc.internal.getNumberOfPages();
    doc.setPage(lastPage);
    
    let startY = doc.lastAutoTable.finalY + 15;
    
    if (startY > 250) {
        doc.addPage();
        startY = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Statistiques des Tickets", centerX, startY, { align: "center" });
    
    const statsHeaders = [["Département", "En attente", "En cours", "Résolu", "Total"]];
    const statsData = Object.keys(stats).map(dept => [
        dept,
        stats[dept]["En attente"],
        stats[dept]["En cours"],
        stats[dept]["Résolu"],
        stats[dept].total
    ]);
    
    doc.autoTable({
        head: statsHeaders,
        body: statsData,
        startY: startY + 10,
        margin: { left: 15, right: 15 }, // Marges symétriques
        theme: "grid",
        styles: {
            fontSize: 10,
            cellPadding: 3,
            halign: "center"
        },
        headStyles: {
            fillColor: [46, 204, 113],
            textColor: 255,
            fontStyle: "bold",
            halign: "center"
        },
        columnStyles: {
            0: { cellWidth: 40, halign: "center" },
            1: { cellWidth: 25, halign: "center" },
            2: { cellWidth: 25, halign: "center" },
            3: { cellWidth: 25, halign: "center" },
            4: { cellWidth: 25, halign: "center" }
        }
    });
    
    // Signature centrée
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text("Signature du responsable IT: ________________________", centerX, finalY, { align: "center" });
    
    // Pied de page centré
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} sur ${pageCount}`, pageWidth - 10, 287, { align: "right" });
        doc.text("© Système de Gestion des Tickets - Hôtel", centerX, 287, { align: "center" });
    }
    
    doc.save(`tickets_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function afficherStatistiquesTickets() {
    const stats = {}; // { departement: {en_attente: 0, en_cours: 0, resolu: 0, total: 0} }

    tickets.forEach(ticket => {
        const dept = ticket.departement;
        const status = ticket.status;

        if (!stats[dept]) {
            stats[dept] = { "En attente": 0, "En cours": 0, "Résolu": 0, total: 0 };
        }

        if (stats[dept][status] !== undefined) {
            stats[dept][status]++;
        }
        stats[dept].total++;
    });

    const table = document.createElement("table");
    table.className = "stats-table";
    // Ajouter une classe pour le responsive
    table.className = "stats-table";
    table.style.width = "100%";
    table.style.tableLayout = "auto";
    table.innerHTML = `
        <tr>
            <th>Département</th>
            <th>En attente</th>
            <th>En cours</th>
            <th>Résolu</th>
            <th>Total</th>
        </tr>
    `;

    for (const dept in stats) {
        const s = stats[dept];
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${dept}</td>
            <td>${s["En attente"]}</td>
            <td>${s["En cours"]}</td>
            <td>${s["Résolu"]}</td>
            <td>${s.total}</td>
        `;
        table.appendChild(row);
    }

    const statsContent = document.getElementById("statsContent");
    statsContent.innerHTML = "";
    statsContent.appendChild(table);
}

function notifierNouveauTicket(deptSource) {
    // Seulement pour le département IT
    if (currentDepartement !== "IT") return;

    const son = document.getElementById("notifSound");
    const alerte = document.getElementById("notifAlert");

    alerte.textContent = `📬 Nouveau ticket reçu de ${deptSource}`;
    alerte.style.display = "block";

   if (son) {
        son.play().catch(e => {
            console.error("La lecture audio a échoué :", e);
            alert(`📬 Nouveau ticket de ${deptSource}`);
        });
    } else {
        alert(`📬 Nouveau ticket de ${deptSource}`);
    }

    setTimeout(() => {
        alerte.style.display = "none";
    }, 5000);
}

// Ajoutez l'événement pour le bouton d'archivage
archiveResolvedBtn.addEventListener("click", archiverTicketsResolus);
// Gestion du redimensionnement pour l'affichage responsive
window.addEventListener('resize', function() {
    if (currentDepartement === "IT") {
        afficherStatistiquesTickets();
    }
});

// Initialisation au chargement
window.addEventListener('load', function() {
    if (currentDepartement === "IT") {
        setTimeout(afficherStatistiquesTickets, 100);
    }
});