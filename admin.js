async function loadAppointments() {

    try {

        const response = await fetch("/appointments");

        const appointments = await response.json();

        const table = document.getElementById("appointmentTable");

        table.innerHTML = "";


        let total = appointments.length;
        let pending = 0;
        let accepted = 0;
        let rejected = 0;


        appointments.forEach(appointment => {

            // Count status

            if (appointment.status === "Pending") {
                pending++;
            }

            if (appointment.status === "Accepted") {
                accepted++;
            }

            if (appointment.status === "Rejected") {
                rejected++;
            }


            const row = document.createElement("tr");


            // Format date

            const formattedDate = new Date(
                appointment.appointment_date
            ).toLocaleDateString("en-IN");


            // Format time

            const formattedTime =
                appointment.appointment_time
                    ? appointment.appointment_time.substring(0, 5)
                    : "";


            let actionHTML = "";


            // -------------------------
            // PENDING
            // -------------------------

            if (appointment.status === "Pending") {

                actionHTML = `
                    <button
                        class="accept"
                        onclick="updateStatus(
                            ${appointment.appointment_id},
                            'Accepted'
                        )">
                        Accept
                    </button>

                    <button
                        class="reject"
                        onclick="updateStatus(
                            ${appointment.appointment_id},
                            'Rejected'
                        )">
                        Reject
                    </button>
                `;

            }


            // -------------------------
            // ACCEPTED
            // -------------------------

            else if (appointment.status === "Accepted") {

                /*
                    Customer phone number is used
                    to open WhatsApp directly.
                */

                let customerNumber =
                    appointment.phone.replace(/\D/g, "");


                // Add India country code if required

                if (customerNumber.length === 10) {
                    customerNumber = "91" + customerNumber;
                }


                const whatsappMessage =
                    `Hello ${appointment.customer_name},%0A%0A` +

                    `Your appointment at THE J SALON has been ACCEPTED.%0A%0A` +

                    `Service: ${appointment.service_name}%0A` +

                    `Date: ${formattedDate}%0A` +

                    `Time: ${formattedTime}%0A` +

                    `Price: ₹${appointment.price}%0A%0A` +

                    `Thank you for choosing THE J SALON.`;


                const whatsappURL =
                    `https://wa.me/${customerNumber}?text=${whatsappMessage}`;


                actionHTML = `
                    <a
                        href="${whatsappURL}"
                        target="_blank"
                        class="whatsapp-button">

                        💬 WhatsApp Customer

                    </a>
                `;

            }


            // -------------------------
            // REJECTED
            // -------------------------

            else if (appointment.status === "Rejected") {

                actionHTML = `
                    <span class="no-action">
                        No Action
                    </span>
                `;

            }


            // Create table row

            row.innerHTML = `

                <td>
                    ${appointment.appointment_id}
                </td>

                <td>
                    ${appointment.customer_name}
                </td>

                <td>
                    ${appointment.phone}
                </td>

                <td>
                    ${appointment.email || "-"}
                </td>

                <td>
                    ${appointment.service_name}
                </td>

                <td>
                    ₹${appointment.price}
                </td>

                <td>
                    ${formattedDate}
                </td>

                <td>
                    ${formattedTime}
                </td>

                <td>

                    <span class="
                        status
                        ${appointment.status.toLowerCase()}
                    ">

                        ${appointment.status}

                    </span>

                </td>

                <td>

                    ${actionHTML}

                </td>
            `;


            table.appendChild(row);

        });


        // Update summary cards

        document.getElementById(
            "totalAppointments"
        ).innerText = total;


        document.getElementById(
            "pendingAppointments"
        ).innerText = pending;


        document.getElementById(
            "acceptedAppointments"
        ).innerText = accepted;


        document.getElementById(
            "rejectedAppointments"
        ).innerText = rejected;


    } catch (error) {

        console.log(
            "Error loading appointments:",
            error
        );

    }
}



// =====================================
// UPDATE APPOINTMENT STATUS
// =====================================

async function updateStatus(
    appointmentId,
    status
) {

    try {

        const response = await fetch(
            `/appointments/${appointmentId}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );


        const result = await response.json();


        if (response.ok) {

            alert(result.message);

            // Reload appointments

            loadAppointments();

        } else {

            alert(result.message);

        }


    } catch (error) {

        console.log(
            "Status update error:",
            error
        );

        alert(
            "Unable to update appointment."
        );

    }
}



// Load appointments when page opens

loadAppointments();