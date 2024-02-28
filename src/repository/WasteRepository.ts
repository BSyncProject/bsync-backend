import { Waste, WasteModel } from '../models/Waste'; // Assuming Waste model is defined

class WasteRepository {

  async create(wasteData: Partial<Waste>): Promise<Waste> {
    const newWaste = await WasteModel.create(wasteData);
    return newWaste;
  }

  async getAll(): Promise<Waste[]> {
    const allWastes = await WasteModel.find().populate('producer').exec();
    return allWastes;
  }

  async getById(id: string): Promise<Waste | null> {
    const waste = await WasteModel.findById(id).populate('producer').exec();
    return waste;
  }

  async update(id: string, wasteData: Partial<Waste>): Promise<Waste | null> {
    const updatedWaste = await WasteModel.findByIdAndUpdate(id, wasteData, { new: true }).exec();
    return updatedWaste;
  }

  async delete(id: string): Promise<void> {
    await WasteModel.findByIdAndDelete(id).exec();
  }
}

export default WasteRepository;