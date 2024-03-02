import { Picker } from "../models/Picker";
import PickerRepository from "../repository/PickerRepository";

const pickerRepository = new PickerRepository()

class PickerServices {

  async addPicker(pickerData: any): Promise<Picker> {

    const picker = await pickerRepository.create(pickerData);
    return picker;

  }

  async deletePicker(picker_id: string): Promise<string>{

    await pickerRepository.delete(picker_id);

    return 'picker deleted successfully';

  }

  async updatePicker(picker_id: string, pickerData: any): Promise<Picker | null> {
    
    const picker = await pickerRepository.update(picker_id, pickerData);
    return picker;
  }

  async findOne(phoneNumber: string){
    const foundPicker: Picker | null = await pickerRepository.findOne(phoneNumber);
    
    if(foundPicker == null){
      throw new Error(`picker with phoneNumber ${phoneNumber} not found`);
    }

    return foundPicker;
  }
}

export default PickerServices;


