import { Collector, CollectorModel } from '../models/Collector'; // Assuming Collector model is defined

class CollectorRepository {
  // Method to create a new collector
  async create(collectorData: Partial<Collector>): Promise<Collector> {
    const newCollector = await CollectorModel.create(collectorData);
    return newCollector;
  }

  // Method to get all collectors
  async getAll(): Promise<Collector[]> {
    const allCollectors = await CollectorModel.find().populate('picker').exec();
    return allCollectors;
  }

  // Method to get a collector by ID
  async getById(id: string): Promise<Collector | null> {
    const collector = await CollectorModel.findById(id).populate('picker').exec();
    return collector;
  }

  // Method to update a collector
  async update(id: string, collectorData: Partial<Collector>): Promise<Collector | null> {
    const updatedCollector = await CollectorModel.findByIdAndUpdate(id, collectorData, { new: true }).exec();
    return updatedCollector;
  }

  // Method to delete a collector
  async delete(id: string): Promise<void> {
    await CollectorModel.findByIdAndDelete(id).exec();
  }
}

export default CollectorRepository;
