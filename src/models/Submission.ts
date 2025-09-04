import { Schema, model, models } from "mongoose";

const GeoSchema = new Schema(
  { 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracy: { type: Number, default: null }
  },
  { _id: false }
);

const ItemSchema = new Schema(
  {
    productName: {
      type: String,
      enum: ["SBC 40cl", "NBC 40cl", "RC Cola 40cl", "Pop Cola 40cl", "Bigi 40cl"],
      required: true,
    },
    buyPrice: { type: Number, required: true, min: 0 },
    sellPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const SubmissionSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    outletName: { type: String, required: true },
    outletAddress: { type: String, required: true },
    area: { type: String, required: true },
    geo: { type: GeoSchema, default: null },
    items: { 
      type: [ItemSchema], 
      validate: {
        validator: function(v: unknown[]) {
          return v && v.length > 0;
        },
        message: 'At least one item is required'
      }
    },
    collectedAt: { type: Date, default: () => new Date() },
    day: { type: String, required: true }, // yyyy-mm-dd derived
    clientMeta: {
      userAgent: String,
      platform: String,
    },
  },
  { timestamps: true }
);

// Indexes
SubmissionSchema.index({ collectedAt: -1 });
SubmissionSchema.index({ outletName: 1, day: 1 }, { unique: true });

export default models.Submission || model("Submission", SubmissionSchema);
