const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(express.json());
app.use(express.static("."));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


// MYSQL CONNECTION

const db = mysql.createPool({

    host: process.env.MYSQLHOST,

    port: Number(process.env.MYSQLPORT || 3306),

    user: process.env.MYSQLUSER,

    password: process.env.MYSQLPASSWORD,

    database: process.env.MYSQLDATABASE,

    connectionLimit: 10,

    waitForConnections: true,

    queueLimit: 0

});


db.getConnection((err, connection) => {

    if (err) {

        console.log("Database connection failed");
        console.log(err.message);

    } else {

        console.log("Database connected successfully");
        connection.release();

    }

});


// BOOK APPOINTMENT

app.post("/book", (req, res) => {

    const {
        name,
        phone,
        email,
        services,
        date,
        time
    } = req.body;


    if (
        !name ||
        !phone ||
        !Array.isArray(services) ||
        services.length === 0 ||
        !date ||
        !time
    ) {

        return res.status(400).json({

            message:
                "Please fill all required fields and select at least one service."

        });

    }


    // INSERT CUSTOMER

    const customerQuery = `
        INSERT INTO customers
        (name, phone, email)
        VALUES (?, ?, ?)
    `;


    db.query(

        customerQuery,

        [name, phone, email],

        (err, customerResult) => {

            if (err) {

                console.log(
                    "Customer insert error:",
                    err.message
                );

                return res.status(500).json({

                    message:
                        "Unable to save customer."

                });

            }


            const customerId =
                customerResult.insertId;


            // INSERT APPOINTMENT

            const appointmentQuery = `

                INSERT INTO appointments

                (
                    customer_id,
                    service_id,
                    appointment_date,
                    appointment_time,
                    status
                )

                VALUES (?, ?, ?, ?, 'Pending')

            `;


            const firstServiceId =
                services[0];


            db.query(

                appointmentQuery,

                [
                    customerId,
                    firstServiceId,
                    date,
                    time
                ],

                (err, appointmentResult) => {

                    if (err) {

                        console.log(
                            "Appointment insert error:",
                            err.message
                        );

                        return res.status(500).json({

                            message:
                                "Unable to book appointment."

                        });

                    }


                    const appointmentId =
                        appointmentResult.insertId;


                    // INSERT ALL SERVICES

                    const serviceValues =
                        services.map(serviceId => [

                            appointmentId,
                            serviceId

                        ]);


                    const serviceQuery = `

                        INSERT INTO appointment_services

                        (
                            appointment_id,
                            service_id
                        )

                        VALUES ?

                    `;


                    db.query(

                        serviceQuery,

                        [serviceValues],

                        (err) => {

                            if (err) {

                                console.log(
                                    "Appointment services insert error:",
                                    err.message
                                );

                                return res.status(500).json({

                                    message:
                                        "Unable to save selected services."

                                });

                            }


                            res.status(201).json({

                                message:
                                    "Appointment booked successfully!"

                            });

                        }

                    );

                }

            );

        }

    );

});


// GET APPOINTMENTS

app.get("/appointments", (req, res) => {

    const query = `

        SELECT

            a.appointment_id,

            c.name AS customer_name,

            c.phone,

            c.email,

            GROUP_CONCAT(

                DISTINCT s.service_name

                ORDER BY s.service_id

                SEPARATOR ', '

            ) AS service_name,

            COALESCE(
                SUM(s.price),
                0
            ) AS price,

            a.appointment_date,

            a.appointment_time,

            a.status

        FROM appointments a

        JOIN customers c
            ON a.customer_id = c.customer_id

        LEFT JOIN appointment_services aps
            ON a.appointment_id = aps.appointment_id

        LEFT JOIN services s
            ON aps.service_id = s.service_id

        GROUP BY

            a.appointment_id,
            c.name,
            c.phone,
            c.email,
            a.appointment_date,
            a.appointment_time,
            a.status

        ORDER BY a.appointment_id DESC

    `;


    db.query(query, (err, results) => {

        if (err) {

            console.log(
                "Appointment fetch error:",
                err.message
            );

            return res.status(500).json({

                message:
                    "Unable to fetch appointments."

            });

        }

        res.json(results);

    });

});


// ACCEPT / REJECT

app.put(
    "/appointments/:id/status",
    (req, res) => {

        const appointmentId =
            req.params.id;

        const { status } =
            req.body;


        if (
            status !== "Accepted" &&
            status !== "Rejected"
        ) {

            return res.status(400).json({

                message:
                    "Invalid status."

            });

        }


        const query = `

            UPDATE appointments

            SET status = ?

            WHERE appointment_id = ?

        `;


        db.query(

            query,

            [
                status,
                appointmentId
            ],

            (err, result) => {

                if (err) {

                    console.log(
                        "Status update error:",
                        err.message
                    );

                    return res.status(500).json({

                        message:
                            "Unable to update appointment status."

                    });

                }


                if (result.affectedRows === 0) {

                    return res.status(404).json({

                        message:
                            "Appointment not found."

                    });

                }


                res.json({

                    message:
                        `Appointment ${status.toLowerCase()} successfully.`

                });

            }

        );

    }
);


// START SERVER

const PORT =
    process.env.PORT || 3000;


app.listen(

    PORT,

    "0.0.0.0",

    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }

);