import { Producer, ProducerModel } from '../models/Producer'; // Assuming Producer model is defined

class ProducerRepository {

  async create(producerData: Partial<Producer>): Promise<Producer> {
    const newProducer = await ProducerModel.create(producerData);
    return newProducer;
  }


  async check(username: string, email: string){

    const producer = await this.findOne(username);
    if(producer){
      return producer;
    } else {
      return ProducerModel.findOne({email: email});
    }

  }

  async findOne(username: string){
    const foundProducer =  ProducerModel.findOne({username: username});
    return foundProducer;
  }

  async getAll(): Promise<Producer[]> {
    const allProducers = await ProducerModel.find().populate('waste').exec();
    return allProducers;
  }

  async getById(id: string): Promise<Producer | null> {
    const producer = await ProducerModel.findById(id).populate('waste').exec();
    return producer;
  }

  async update(id: string, producerData: Partial<Producer>): Promise<Producer | null> {
    const updatedProducer = await ProducerModel.findByIdAndUpdate(id, producerData, { new: true }).exec();
    return updatedProducer;
  }

  async delete(id: string): Promise<void> {
    await ProducerModel.findByIdAndDelete(id).exec();
  }
}

export default ProducerRepository;
