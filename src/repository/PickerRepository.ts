import { Collector } from '../models/Collector';
import { Picker, PickerModel } from '../models/Picker'; // Assuming Picker model is defined

class PickerRepository {

  async findByCollector(collector: Collector): Promise<Picker[]> {
    const foundPickers = await PickerModel.find({ collector: collector }).exec()
    return foundPickers;
}

  async create(pickerData: Partial<Picker>): Promise<Picker> {
    const newPicker = await PickerModel.create(pickerData);
    return newPicker;
  }

  async getAll(): Promise<Picker[]> {
    const allPickers = await PickerModel.find().populate('collector').exec();
    return allPickers;
  }

  async getById(id: string): Promise<Picker | null> {
    const picker = await PickerModel.findById(id).populate('collector').exec();
    return picker;
  }

  async update(id: string, pickerData: Partial<Picker>): Promise<Picker | null> {
    const updatedPicker = await PickerModel.findByIdAndUpdate(id, pickerData, { new: true }).exec();
    return updatedPicker;
  }

  async delete(id: string): Promise<void> {
    await PickerModel.findByIdAndDelete(id).exec();
  }

  async findOne(phoneNumber: string): Promise<Picker | null>{
    const foundCollector: Picker | null =  await PickerModel.findOne({phoneNumber: phoneNumber});
    return foundCollector;
  }

  async findByServiceArea(location: string): Promise<Picker[]> {
    return await PickerModel.find({ serviceArea: location }).exec();
  }

}

export default PickerRepository;
