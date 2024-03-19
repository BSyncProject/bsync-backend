import { Producer } from '../models/Producer';
import { Waste, WasteModel } from '../models/Waste'; // Assuming Waste model is defined

class WasteRepository {

  async markAsSold(wasteId: string) {
    const waste = this.update(wasteId, {isSold: true});
    return waste;
  }

  async create(wasteData: Partial<Waste>): Promise<Waste> {
    const newWaste = await WasteModel.create(wasteData);
    return newWaste;
  }

  async findWastesWithAddress(address: string): Promise<Waste[]>{
    const wastes = await WasteModel.find({location: address}).populate('producer').exec();
    return wastes;
  }

  async findWastesByProducer(producer: Producer): Promise<Waste[]> {
    const wastes = await WasteModel.find({ producer: producer, isSold: false}).exec();
    return wastes;
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
