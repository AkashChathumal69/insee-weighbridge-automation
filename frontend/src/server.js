const express = require('express');
const cors = require('cors');
const ExcelJS = require('exceljs');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const FILE_PATH = './dispatchdata.xlsx';

app.post('/save-dispatch', async (req, res) => {
    const data = req.body;

    const workbook = new ExcelJS.Workbook();
    let worksheet;

    if (fs.existsSync(FILE_PATH)) {
        await workbook.xlsx.readFile(FILE_PATH);
        worksheet = workbook.getWorksheet('Dispatch');
    } else {
        worksheet = workbook.addWorksheet('Dispatch');
        worksheet.columns = [
            { header: 'Token', key: 'token', width: 15 },
            { header: 'Driver Name', key: 'driver', width: 20 },
            { header: 'Vehicle No', key: 'vehicle', width: 15 },
            { header: 'Delivery No', key: 'delivery', width: 20 },
            { header: 'PPE Status', key: 'ppe', width: 15 },
            { header: 'Weigh Date', key: 'Date', width: 15 },
        ];
    }

    worksheet.addRow({
        token: data.tokenNumber,
        driver: data.driverName,
        vehicle: data.vehicleNumber,
        delivery: data.deliveryNumber,
        ppe: data.ppeStatus,
        time: data.wayoutTime,
    });

    await workbook.xlsx.writeFile(FILE_PATH);

    res.json({ success: true });
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
