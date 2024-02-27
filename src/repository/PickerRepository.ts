import { Picker, PickerModel } from '../models/Picker'; // Assuming Picker model is defined

class PickerRepository {
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
}

export default PickerRepository;
