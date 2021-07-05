import React, { Component } from 'react';
import dataJson from './../data.json';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import './index.css';

type Props = {
    isAddAppointment: boolean;
}

type State = {
    isAddAppointment: boolean;
    pname: string,
    clinicName: string;
    startDate: string;
    endDate: string;
    data: any,
    filterBy: any,
    clinicGroup: any,
    dateSearch: any,
}

class UserData extends Component<Props, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            data: [],
            filterBy: 0,
            clinicGroup: [],
            isAddAppointment: false,
            pname: '',
            clinicName: '',
            startDate: '',
            endDate: '',
            dateSearch: ''
        }
    }

    componentDidMount() {

        if (localStorage.getItem('dataArray')) {
            this.setState({
                data: JSON.parse(localStorage.getItem('dataArray')).sort((a: any, b: any) => new Date(a.startDate) - new Date(b.startDate))
            })
        } else {
            localStorage.setItem('dataArray', JSON.stringify(dataJson));
            this.setState({
                data: dataJson.sort((a: any, b: any) => new Date(a.startDate) - new Date(b.startDate))
            })
        }
    }

    addAppointment = () => {
        this.setState({
            isAddAppointment: true
        })
    }

    closeAppointment = () => {
        this.setState({
            isAddAppointment: false
        });
        document.getElementById("form-appoinment").reset();
    }

    addData = (e: React.FormEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            pname: { value: string };
            clinicName: { value: string };
            startDate: { value: string };
            endDate: { value: string };
        };
        const name = target.pname.value; // typechecks!
        const clinicName = target.clinicName.value; // typechecks!
        const startDate = target.startDate.value;
        const endDate = target.endDate.value;
        const singleData = {
            id: uuidv4(),
            startDate: startDate,
            endDate: endDate,
            clinicianName: clinicName,
            patient: {
                id: uuidv4(),
                name: name
            },
            status: "ACTIVE"
        }
        const newArray: any = [...this.state.data, singleData];
        localStorage.setItem('dataArray', JSON.stringify(newArray));
        this.setState({
            isAddAppointment: false,
            data: newArray
        })
        document.getElementById("form-appoinment").reset();
    }

    deleteRow = (row: any) => {
        const newArray = this.state.data.filter((info: any) => info.id !== row.id);
        localStorage.setItem('dataArray', JSON.stringify(newArray));
        this.setState({
            data: newArray
        })
    }

    filterBy = (e: any) => {
        const value = e.target.value;
        const dataArray = JSON.parse(localStorage.getItem('dataArray'))
        let clinicNameArray: any = [];
        if (Number(value) === 1) {
            const filterArray: any = this.state.data.map((info: any) => ({ label: info.clinicianName }))
            clinicNameArray = filterArray.reduce((accumalator: any, current: any) => {
                if (!accumalator.some((item: any) => item.label.toLowerCase() === current.label.toLowerCase())) {
                    accumalator.push(current);
                }
                return accumalator;
            }, []);
        } else {
            clinicNameArray = dataArray;
        }
        this.setState({
            filterBy: value,
            clinicGroup: clinicNameArray
        })
    }

    filterDateHandler = (e: any) => {
        const date = e.target.value;
        this.setState({
            dateSearch: date
        });
    }

    dateSearchFun = () => {
        const dataArray = JSON.parse(localStorage.getItem('dataArray'))
        if (this.state.dateSearch !== '') {
            const date = moment(this.state.dateSearch).format('DD-MMM-YYYY');
            const dateFilter: any = dataArray.filter((info: any) => moment(info.startDate).format('DD-MMM-YYYY') === date)
            this.setState({
                data: dateFilter
            })
        } else {
            this.setState({
                data: dataArray
            })
        }
    }

    filterSearchHandler = (e: any) => {
        const data = JSON.parse(localStorage.getItem('dataArray'))
        const search: any = e.target.value

        // console.log(search)
        if (search === 'Select') {
            this.setState({
                data: data
            })
        } else {
            const searchArray: any = data.filter((info: any) => info.clinicianName.toLowerCase() === search.toLowerCase())
            this.setState({
                data: searchArray
            })
        }
    }


    // addData = (e) => {
    //     e.preventDefault();

    // }
    renderTR = (info: any, i: number) => {
        const endDate = moment(info.endDate);
        const startDate = moment(info.startDate);
        var duration = moment.duration(endDate.diff(startDate));
        var hours = duration.asHours();


        return <tr key={i} className={hours > 1 ? 'cls-highlight' : ''}>
            <td>{info.patient.name}</td>
            <td>{moment(info.startDate).format('DD-MMM-YYYY hh:mm')}</td>
            <td>{moment(info.endDate).format('DD-MMM-YYYY hh:mm')}</td>
            <td>{hours}</td>
            <td>{info.clinicianName}</td>
            <td>{info.status}</td>
            <td><button type="button" onClick={() => this.deleteRow(info)}>Delete</button></td>
        </tr>

    }
    render() {
        // console.log(this.state.clinicGroup);
        return (
            !this.state.isAddAppointment ?
                <>
                    <button type="button" onClick={this.addAppointment}>Add Appointment</button>
                    <select name="filterBy" value={this.state.filterBy} onChange={this.filterBy}>
                        <option value="0">Please select</option>
                        <option value="1">Clinican Name</option>
                        <option value="2">Date</option>
                    </select>
                    {Number(this.state.filterBy) > 0 ?
                        <div>
                            {Number(this.state.filterBy) === 2 && <><input type="date" onChange={this.filterDateHandler} /><button type="button" onClick={this.dateSearchFun}>Search</button></>}
                            {Number(this.state.filterBy) === 1 && <select onChange={this.filterSearchHandler} placeholder="select clinic name">
                                {this.state.clinicGroup.length > 0 ?
                                    <>
                                        <option>Select</option>
                                        {this.state.clinicGroup.map((info: any, i: number) => <option key={i} value={info.label}>{info.label}</option>)}
                                    </>
                                    :
                                    null
                                }
                            </select>}
                        </div>
                        :
                        null
                    }
                    <table border={1} width="100%">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>startDate</th>
                                <th>endDate</th>
                                <th>Duration</th>
                                <th>clinicianName</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {this.state.data && this.state.data.length > 0 ?
                                this.state.data.map((info: any, i: number) => this.renderTR(info, i))
                                :
                                <tr><td colSpan={7}>Data not found.</td></tr>
                            }
                        </tbody>
                    </table>
                </>
                :
                <form method="post" action="/" onSubmit={this.addData} id="form-appoinment">
                    <div>
                        <label>Name</label>
                        <input type="text" name="pname" />
                    </div>
                    <div>
                        <label>Clinic Name</label>
                        <input type="text" name="clinicName" />
                    </div>
                    <div>
                        <label>Start Date</label>
                        <input type="datetime-local" name="startDate" />
                    </div>
                    <div>
                        <label>End Date</label>
                        <input type="datetime-local" name="endDate" />
                    </div>
                    <div>
                        <button type="submit">Save</button>
                        <button type="button" onClick={this.closeAppointment}>Cancel</button>
                    </div>
                </form>

        )
    }
}
export default UserData;