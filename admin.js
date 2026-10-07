async function loadAppointments() {

    try {

        const response = await fetch("/appointments");

        const appointments = await response.json();

        const table =
            document.getElementById("appointmentTable");

        table.innerHTML = "";


        let total = appointments.length;
        let pending = 0;
        let accepted = 0;
        let rejected = 0;


        appointments.forEach(appointment => {

            // =====================================
            // COUNT STATUS
            // =====================================

            if (appointment.status === "Pending") {
                pending++;
            }

            if (appointment.status === "Accepted") {
                accepted++;
            }

            if (appointment.status === "Rejected") {
                rejected++;
            }


            const row =
                document.createElement("tr");


            // =====================================
            // FORMAT DATE
            // =====================================

            const formattedDate =
                new Date(
                    appointment.appointment_date
                ).toLocaleDateString("en-IN");


            // =====================================
            // FORMAT TIME
            // =====================================

            const formattedTime =
                appointment.appointment_time
                    ? appointment.appointment_time.substring(0, 5)
                    : "";


            let actionHTML = "";


            // =====================================
            // PENDING
            // =====================================

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


            // =====================================
            // ACCEPTED
            // =====================================

            else if (appointment.status === "Accepted") {

                let customerNumber =
                    appointment.phone.replace(/\D/g, "");


                // Add India country code

                if (customerNumber.length === 10) {

                    customerNumber =
                        "91" + customerNumber;

                }


                const whatsappMessage =
                    `Hello ${appointment.customer_name},\n\n` +

                    `Your appointment at THE J SALON has been ACCEPTED.\n\n` +

                    `Services: ${appointment.service_name}\n` +

                    `Date: ${formattedDate}\n` +

                    `Time: ${formattedTime}\n` +

                    `Total Price: ₹${appointment.price}\n\n` +

                    `Thank you for choosing THE J SALON.`;


                const whatsappURL =
                    `https://wa.me/${customerNumber}?text=${encodeURIComponent(
                        whatsappMessage
                    )}`;


                actionHTML = `
                    <a
                        href="${whatsappURL}"
                        target="_blank"
                        class="whatsapp-button">

                        💬 WhatsApp Customer

                    </a>
                `;

            }


            // =====================================
            // REJECTED
            // =====================================

            else if (appointment.status === "Rejected") {

                actionHTML = `
                    <span class="no-action">
                        No Action
                    </span>
                `;

            }


            // =====================================
            // CREATE TABLE ROW
            // =====================================

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


        // =====================================
        // UPDATE SUMMARY CARDS
        // =====================================

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

        const response =
            await fetch(
                `/appointments/${appointmentId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: status
                    })

                }
            );


        const result =
            await response.json();


        if (response.ok) {

            alert(result.message);

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



// =====================================
// LOAD APPOINTMENTS
// =====================================

loadAppointments();