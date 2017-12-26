
export class Location  {
    private _id: number;
    private _name: string;
    private _address: string;
    private _lat: number;
    private _lng: number;

    constructor (id: number, name: string, addrs: string, lat: number, lng: number) {
        this._id = id;
        this._name = name;
        this._address = addrs;
        this._lat = lat;
        this._lng = lng;
    }

    setName(name:string) {
        this._name = name;
    }

    setAddress(addrs:string) {
        this._address = addrs;
    }

    setLng(lng:number) {
        this._lng = lng;
    }

    setLat(lat:number) {
        this._lat = lat;
    }

    // https://stackoverflow.com/a/27943/4725731
    getDistanceInKm(lat1:number, lng1:number):number {
        let R = 6371; // Radius of the earth in km
        let dLat = this.deg2rad(this._lat-lat1);  // deg2rad below
        let dLon = this.deg2rad(this._lng-lng1);
        let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(this._lat)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        let d = R * c; // Distance in km
        return d;
    }

    private deg2rad(deg: number):number {
        return deg * (Math.PI/180)
    }

    toHTMLString():string {
        let html:string = "Id: " + this._id + "</br> Name: " + this._name + "</br> Address: " + this._address + 
                        "</br> Latitude: " + this._lat + "</br> Longitude: " + this._lng
        return html;
    }
}
